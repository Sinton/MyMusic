use std::sync::Arc;
use std::path::PathBuf;
use std::fs::File;
use std::io::{BufReader, BufWriter};
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
                let mut file = File::create(&self.storage_path)
            .map(BufWriter::new)
            .map_err(|e| AppError::Internal(format!("Failed to create cookie file: {}", e)))?;
        
        let store = self.cookie_store.lock().map_err(|_| AppError::Internal("Lock poison".to_string()))?;
                store.save_json(&mut file)
            .map_err(|e| AppError::Internal(format!("Failed to save cookies: {}", e)))?;
        Ok(())
    }

    pub async fn request(
        &self,
        method: &str,
        url: &str,
        headers_list: Vec<(String, String)>,
        body: String,
    ) -> HttpResult<HttpResponse> {
        let mut headers = HeaderMap::new();
        
        for (k, v) in headers_list {
            if let Ok(hname) = k.parse::<reqwest::header::HeaderName>() {
                if let Ok(hval) = HeaderValue::from_str(&v) {
                    headers.insert(hname, hval);
                }
            }
        }

        let builder = match method.to_uppercase().as_str() {
            "GET" => self.internal.get(url),
            "POST" => self.internal.post(url).body(body),
                        _ => return Err(AppError::Internal(format!("Unsupported method: {}", method))),
        };

        log::debug!("[HTTP] {} {}", method, url);
        let resp = builder
            .headers(headers)
            .send()
            .await
            .map_err(AppError::from)?;

        let status = resp.status().as_u16();
        log::debug!("[HTTP] Response Status: {}", status);

        
        // Extract headers
        let mut resp_headers = std::collections::HashMap::new();
        for (k, v) in resp.headers() {
             if let Ok(val) = v.to_str() {
                 resp_headers.insert(k.to_string(), val.to_string());
             }
        }

        // Also extract Set-Cookie specifically if multiple?
        // reqwest headers iteration iterates over all values. 
        // But HashMap overwrites. 
        // For login, we might need all Set-Cookie values joined?
        // NeteaseService expects "Set-Cookie" or "set-cookie".
        // Let's manually collect Set-Cookie.
        let cookie_headers: Vec<String> = resp.headers()
            .get_all(SET_COOKIE)
            .iter()
            .map(|v| v.to_str().unwrap_or("").to_string())
            .collect();
        
        if !cookie_headers.is_empty() {
            resp_headers.insert("set-cookie".to_string(), cookie_headers.join(";;")); // custom separator? or just first?
            // Frontend logic: .map(c => c.split(';')[0]).join('; ')
            // NeteaseService.ts handles list if it's an array, or string.
            // But we return HashMap<String, String>. We can't return array.
            // Let's join with `;;` and frontend can split if needed, or just standard `; ` logic?
            // Actually, `reqwest` cookie store handles the cookies for NEXT requests automatically.
            // The frontend only needs it to save to localStorage. 
            // Valid valid.
            // Let's just join them.
             resp_headers.insert("set-cookie".to_string(), cookie_headers.join(", ")); 
        }

                let text = resp.text().await.map_err(AppError::from)?;
        
        // Try parsing as JSON
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

        // Save cookies to file
        let _ = self.save_cookies();

        Ok(HttpResponse {
            status,
            headers: resp_headers,
            body: body_json,
        })
    }
}
