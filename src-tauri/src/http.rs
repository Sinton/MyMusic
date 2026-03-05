use std::sync::Arc;
use std::path::PathBuf;
use std::fs::File;
use std::io::{BufReader, BufWriter, Write};
use crate::error::{AppError, AppResult};
use reqwest::header::{HeaderMap, HeaderValue, SET_COOKIE};
use reqwest::{Client, ClientBuilder};
use serde_json::Value;
use reqwest_cookie_store::CookieStoreMutex;
use cookie_store::CookieStore;

// Re-export specific errors if needed
pub type HttpResult<T> = AppResult<T>;

#[derive(serde::Serialize)]
pub struct HttpResponse {
    pub status: u16,
    pub body: Value,
    pub headers: std::collections::HashMap<String, String>,
}

impl HttpResponse {
    pub fn deserialize<T: serde::de::DeserializeOwned>(self) -> HttpResult<T> {
        serde_json::from_value(self.body).map_err(AppError::from)
    }
}

pub struct HttpClient {
    pub internal: Client,
    cookie_store: Arc<CookieStoreMutex>,
    storage_path: PathBuf,
}

impl HttpClient {
    pub fn new(storage_path: PathBuf) -> Self {
        // Load cookies from file if exists
        let cookie_store = if storage_path.exists() {
            let file = File::open(&storage_path).map(BufReader::new).ok();
            let store = file.and_then(|f| CookieStore::load_json(f).ok())
                .unwrap_or_else(CookieStore::default);
            CookieStoreMutex::new(store)
        } else {
            CookieStoreMutex::new(CookieStore::default())
        };

        let cookie_store = Arc::new(cookie_store);

        let client = ClientBuilder::new()
            .cookie_provider(Arc::clone(&cookie_store))
            .build()
            .unwrap();

        HttpClient {
            internal: client,
            cookie_store,
            storage_path,
        }
    }

    pub fn save_cookies(&self) -> AppResult<()> {
        let file = File::create(&self.storage_path)
            .map_err(|e| AppError::Internal(format!("Failed to create cookie file: {}", e)))?;
        let mut writer = BufWriter::new(file);
        
        let store = self.cookie_store.lock().map_err(|_| AppError::Internal("Lock poison".to_string()))?;
        // Use the store's save_json method, ensuring we have the Write trait in scope
        store.save_json(&mut writer)
            .map_err(|e| AppError::Internal(format!("Failed to save cookies: {}", e)))?;
        
        writer.flush().map_err(|e| AppError::Internal(format!("Failed to flush cookie file: {}", e)))?;
        Ok(())
    }

    fn build_common_headers(&self, headers_list: Vec<(String, String)>, referer: Option<String>) -> HeaderMap {
        let mut headers = HeaderMap::new();
        
        // Default UA
        headers.insert(
            reqwest::header::USER_AGENT,
            HeaderValue::from_static(crate::config::DEFAULT_USER_AGENT)
        );

        if let Some(r) = referer {
            if let Ok(val) = HeaderValue::from_str(&r) {
                headers.insert(reqwest::header::REFERER, val);
            }
        }

        for (k, v) in headers_list {
            if let Ok(hname) = k.parse::<reqwest::header::HeaderName>() {
                if let Ok(hval) = HeaderValue::from_str(&v) {
                    headers.insert(hname, hval);
                }
            }
        }
        headers
    }

    pub async fn request(
        &self,
        method: &str,
        url: &str,
        headers_list: Vec<(String, String)>,
        body: String,
        trace_id: Option<String>,
    ) -> HttpResult<HttpResponse> {
        let current_trace_id = trace_id.unwrap_or_else(|| "no-trace".to_string());
        let headers = self.build_common_headers(headers_list, None);

        let builder = match method.to_uppercase().as_str() {
            "GET" => self.internal.get(url),
            "POST" => self.internal.post(url).body(body.clone()),
            _ => return Err(AppError::Internal(format!("Unsupported method: {}", method))),
        };

        // Construct curl for debugging
        let mut curl = format!("curl -L -X {} '{}'", method.to_uppercase(), url);
        for (k, v) in &headers {
             curl.push_str(&format!(" -H '{}: {}'", k, v.to_str().unwrap_or("").replace("'", "'\\''")));
        }

        if let Ok(url_obj) = reqwest::Url::parse(url) {
            if let Ok(store) = self.cookie_store.lock() {
                let cookies: Vec<String> = store.get_request_values(&url_obj)
                    .map(|(name, value)| format!("{}={}", name, value))
                    .collect();
                if !cookies.is_empty() {
                    let cookie_header = cookies.join("; ");
                    curl.push_str(&format!(" -H 'Cookie: {}'", cookie_header.replace("'", "'\\''")));
                }
            }
        }

        if !body.is_empty() {
             curl.push_str(&format!(" -d '{}'", body.replace("'", "'\\''")));
        }

        println!("\n[HTTP REQUEST][{}] Trace: {}\n{}\n", method.to_uppercase(), current_trace_id, curl);
        log::debug!("[HTTP] {} {} (Trace: {})", method, url, current_trace_id);

        let resp = builder
            .headers(headers)
            .send()
            .await
            .map_err(AppError::from)?;

        let status = resp.status().as_u16();
        println!("[HTTP RESPONSE {}][{}] {}\n", status, current_trace_id, url);
        log::debug!("[HTTP] Response Status: {} (Trace: {})", status, current_trace_id);

        let mut resp_headers = std::collections::HashMap::new();
        for (k, v) in resp.headers() {
             if let Ok(val) = v.to_str() {
                 resp_headers.insert(k.to_string(), val.to_string());
             }
        }

        let cookie_headers: Vec<String> = resp.headers()
            .get_all(SET_COOKIE)
            .iter()
            .map(|v| v.to_str().unwrap_or("").to_string())
            .collect();
        
        if !cookie_headers.is_empty() {
             resp_headers.insert("set-cookie".to_string(), cookie_headers.join(", ")); 
        }

        let text = resp.text().await.map_err(AppError::from)?;
        
        let body_json = match serde_json::from_str::<Value>(&text) {
            Ok(json) => json,
            Err(_) => {
                 if text.len() < 500 {
                    serde_json::json!({ "code": status, "msg": text })
                } else {
                    serde_json::json!({ "code": status, "msg": "Invalid JSON response" })
                }
            }
        };

        let _ = self.save_cookies();

        Ok(HttpResponse {
            status,
            headers: resp_headers,
            body: body_json,
        })
    }

    pub async fn request_bytes(
        &self,
        url: &str,
        referer: Option<String>,
        cookie: Option<String>,
        method: Option<String>,
        body: Option<String>,
        content_type: Option<String>,
        trace_id: Option<String>,
    ) -> AppResult<Vec<u8>> {
        let current_trace_id = trace_id.unwrap_or_else(|| "no-trace".to_string());
        let is_post = method.as_deref() == Some("POST");
        
        let mut headers_list = Vec::new();
        if let Some(c) = cookie {
            headers_list.push(("Cookie".to_string(), c));
        }
        if let Some(ct) = content_type {
            headers_list.push(("Content-Type".to_string(), ct));
        }

        let headers = self.build_common_headers(headers_list, referer);

        let mut req = if is_post {
            self.internal.post(url)
        } else {
            self.internal.get(url)
        };

        if let Some(b) = body {
            req = req.body(b);
        }

        println!("[HTTP BYTES REQUEST][{}] Trace: {}", url, current_trace_id);
        let resp = req.headers(headers).send().await.map_err(AppError::from)?;

        let status = resp.status().as_u16();
        println!("[HTTP BYTES RESPONSE {}][{}] {}", status, current_trace_id, url);

        let bytes = resp.bytes().await.map_err(AppError::from)?.to_vec();
        Ok(bytes)
    }
}
