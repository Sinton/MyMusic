use serde::Deserialize;

use tauri::{Manager, State};

#[macro_use]
mod macros;
mod api;
mod query;

mod http;
mod error;
mod stream;

use http::{HttpClient, HttpResponse};

/// Parameters passed from frontend to identify which API to call
#[derive(Clone, Debug, Deserialize)]

pub struct Options {
    pub params: String,
    pub cookie: String,
}

#[tauri::command]
async fn request_bytes(
    client: tauri::State<'_, HttpClient>,
    url: String,
    referer: Option<String>,
    cookie: Option<String>,
    method: Option<String>,
    body: Option<String>,
    content_type: Option<String>,
) -> Result<Vec<u8>, String> {
    let is_post = method.as_deref() == Some("POST");
    
    let mut req = if is_post {
        client.internal.post(&url)
    } else {
        client.internal.get(&url)
    };

    req = req.header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    if let Some(r) = referer {
        req = req.header("Referer", r);
    }

    if let Some(c) = cookie {
        req = req.header("Cookie", c);
    }

    if let Some(ct) = content_type {
        req = req.header("Content-Type", ct);
    }

    if let Some(b) = body {
        req = req.body(b);
    }

    let resp = req.send()
        .await
        .map_err(|e| e.to_string())?;

    let bytes = resp.bytes()
        .await
        .map_err(|e| e.to_string())?
        .to_vec();
    
    Ok(bytes)
}

#[tauri::command]
fn log_info(message: String) {
    #[cfg(debug_assertions)]
    {
        use std::fs::OpenOptions;
        use std::io::Write;
        if let Ok(mut file) = OpenOptions::new()
            .create(true)
            .append(true)
            .open("debug.log")
        {
            let _ = writeln!(file, "[UI] {}", message);
        }
        println!("[UI] {}", message);
    }
}

#[tauri::command]
async fn request_api(
    client: State<'_, HttpClient>,
    provider: String,
    api_name: String,
    params: String,
    cookie: String,
) -> Result<HttpResponse, crate::error::AppError> {
    // log::debug!("[API] Request: {} Params: {}", api_name, params);
    let options = Options {
        params,
        cookie,
    };
    
    match api::dispatch(&client, &provider, &api_name, options).await {
        Ok(res) => {
            log::info!("[API] Success: {}", api_name);
            Ok(res)
        },
        Err(e) => {
            log::error!("[API] Failed: {} Error: {}", api_name, e);
            Err(e)
        }
    }
}

fn main() {
    // Initialize unified logging
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
    log::info!("Starting Music App Backend (v2)...");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
             let app_data_dir = app.path().app_data_dir()
                .expect("Could not determine app data directory");
            
            // Create directory if it doesn't exist
            if !app_data_dir.exists() {
                std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");
            }

            let cookie_path = app_data_dir.join("cookies.json");
            let client = HttpClient::new(cookie_path);
            app.manage(client);

            println!("[Main] Registering musiclocal:// protocol handler (Temporarily disabled)");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![request_api, request_bytes, log_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
