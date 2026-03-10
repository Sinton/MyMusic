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
    #[serde(skip_serializing)]
    pub raw_body: Vec<u8>,
}

impl HttpResponse {
    pub fn deserialize<T: serde::de::DeserializeOwned>(self) -> HttpResult<T> {
        serde_json::from_value(self.body).map_err(AppError::from)
    }
}

pub struct HttpClient {
    pub internal: Client,
    pub no_cookie_client: Client, // New client for clean requests
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
        
        let no_cookie_client = ClientBuilder::new()
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .unwrap();

        HttpClient {
            internal: client,
            no_cookie_client,
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

    pub fn clear_cookies(&self, _domain_pattern: &str) -> AppResult<()> {
        let mut store = self.cookie_store.lock()
            .map_err(|_| AppError::Internal("Lock poison".to_string()))?;
        
        // Reset the store to empty
        *store = CookieStore::default();
        Ok(())
    }

    pub fn add_cookie(&self, url: &str, cookie_str: &str) -> AppResult<()> {
        let url_obj = reqwest::Url::parse(url)
            .map_err(|e| AppError::Internal(format!("Invalid URL for cookie: {}", e)))?;
        
        let mut store = self.cookie_store.lock()
            .map_err(|_| AppError::Internal("Lock poison".to_string()))?;
        
        // We use ';;' as our manual separator for multiple SET-COOKIE style strings
        for cookie in cookie_str.split(";;") {
            let cookie = cookie.trim();
            if cookie.is_empty() { continue; }
            
            // Try to parse it properly. RawCookie::parse expects "name=val; attr1=val1; ..."
            if let Ok(c) = cookie_store::RawCookie::parse(cookie) {
                let _ = store.insert_raw(&c, &url_obj);
                continue;
            }

            // Simple split once fallback
            if let Some((name, val)) = cookie.split_once('=') {
                // If it contains a semicolon, it's probably one with attributes but parse() failed.
                // Try to take only the first name=value part if it's just a simple cookie.
                let clean_name = name.trim();
                let clean_val = if let Some((v, _)) = val.split_once(';') { v.trim() } else { val.trim() };
                
                let simple = format!("{}={}", clean_name, clean_val);
                if let Ok(c) = cookie_store::RawCookie::parse(&simple) {
                    let _ = store.insert_raw(&c, &url_obj);
                }
            }
        }
        Ok(())
    }

    pub fn export_cookies(&self, url: &str) -> String {
        if let Ok(uri) = reqwest::Url::parse(url) {
            if let Ok(store) = self.cookie_store.lock() {
                return store.get_request_values(&uri)
                    .map(|(name, value)| format!("{}={}", name, value))
                    .collect::<Vec<String>>()
                    .join("; ");
            }
        }
        "".to_string()
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
        self.request_full(method, url, headers_list, body, trace_id, true).await
    }

    pub async fn request_full(
        &self,
        method: &str,
        url: &str,
        headers_list: Vec<(String, String)>,
        body: String,
        trace_id: Option<String>,
        use_cookie_store: bool,
    ) -> HttpResult<HttpResponse> {
        let current_trace_id = trace_id.unwrap_or_else(|| "no-trace".to_string());
        let headers = self.build_common_headers(headers_list, None);

        let client = if use_cookie_store { &self.internal } else { &self.no_cookie_client };
        let builder = match method.to_uppercase().as_str() {
            "GET" => client.get(url),
            "POST" => client.post(url).body(body.clone()),
            _ => return Err(AppError::Internal(format!("Unsupported method: {}", method))),
        };

        // Construct curl for debugging
        let mut curl = format!("curl -L -X {} '{}'", method.to_uppercase(), url);
        for (k, v) in &headers {
             curl.push_str(&format!(" -H '{}: {}'", k, v.to_str().unwrap_or("").replace("'", "'\\''")));
        }

        if use_cookie_store {
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
             resp_headers.insert("set-cookie".to_string(), cookie_headers.join(";;")); 
        }

        let raw_bytes = resp.bytes().await.map_err(AppError::from)?.to_vec();
        let text = String::from_utf8_lossy(&raw_bytes).to_string();

        // LOG BODY INSTEAD OF HEADERS
        let log_text = if text.len() > 1000 {
            let mut end = 1000;
            while !text.is_char_boundary(end) && end > 0 {
                end -= 1;
            }
            format!("{}... (truncated)", &text[..end])
        } else {
            text.clone()
        };
        println!("[HTTP DEBUG][{}] Response Body: {}", current_trace_id, log_text);
        
        let body_json = if text.contains("ptuiCB(") {
            // Special handling for QQ ptlogin callbacks: ptuiCB('code', '0', 'url', ...)
            let content = text.trim();
            if let Some(start) = content.find('(') {
                if let Some(end) = content.rfind(')') {
                    let inner = &content[start + 1..end];
                    let parts: Vec<String> = inner.split(',')
                        .map(|s| s.trim().trim_matches('\'').to_string())
                        .collect();
                    
                    let nickname = parts.get(5).cloned().unwrap_or_default();

                    let body = serde_json::json!({
                        "code": parts.get(0).cloned().unwrap_or_default(),
                        "status": parts.get(1).cloned().unwrap_or_default(),
                        "url": parts.get(2).cloned().unwrap_or_default(),
                        "msg": parts.get(4).cloned().unwrap_or_default(),
                        "nickname": nickname,
                        "full_callback": parts
                    });
                    
                    println!("[QQ AUTH DEBUG] Parsed ptuiCB: {:?}", body);
                    body
                } else {
                    serde_json::json!({ "code": status, "msg": text })
                }
            } else {
                serde_json::json!({ "code": status, "msg": text })
            }
        } else {
            match serde_json::from_str::<Value>(&text) {
                Ok(json) => json,
                Err(_) => {
                    if text.is_empty() {
                         serde_json::json!({ "code": status, "msg": "Empty response body" })
                    } else if text.len() < 500 {
                        serde_json::json!({ "code": status, "msg": text })
                    } else {
                        serde_json::json!({ "code": status, "msg": "Invalid JSON response" })
                    }
                }
            }
        };

        let _ = self.save_cookies();

        Ok(HttpResponse {
            status,
            headers: resp_headers,
            body: body_json,
            raw_body: raw_bytes,
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
