use serde::Deserialize;

use tauri::{Manager, State};

#[macro_use]
mod macros;
mod api;
mod query;

mod http;
mod error;
mod config;
mod stream;
mod proxy;

use http::{HttpClient, HttpResponse};

/// Parameters passed from frontend to identify which API to call
#[derive(Clone, Debug, Deserialize)]

pub struct Options {
    pub params: String,
    pub cookie: String,
    pub trace_id: Option<String>,
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
    trace_id: Option<String>,
) -> Result<Vec<u8>, String> {
    client.request_bytes(&url, referer, cookie, method, body, content_type, trace_id)
        .await
        .map_err(|e| e.to_string())
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
    trace_id: Option<String>,
) -> Result<HttpResponse, crate::error::AppError> {
    let current_trace_id = trace_id.clone().unwrap_or_else(|| "no-trace".to_string());
    log::info!("[API] Request: {} Provider: {} (Trace: {})", api_name, provider, current_trace_id);
    
    let options = Options {
        params,
        cookie,
        trace_id: trace_id.clone(),
    };
    
    match api::dispatch(&client, &provider, &api_name, options).await {
        Ok(res) => {
            log::info!("[API] Success: {} (Trace: {})", api_name, current_trace_id);
            Ok(res)
        },
        Err(e) => {
            log::error!("[API] Failed: {} Error: {} (Trace: {})", api_name, e, current_trace_id);
            Err(e)
        }
    }
}

#[tauri::command]
async fn request_api_unified(
    client: State<'_, HttpClient>,
    provider: String,
    api_name: String,
    params: String,
    cookie: String,
    trace_id: Option<String>,
) -> Result<api::models::UnifiedResponse, crate::error::AppError> {
    let current_trace_id = trace_id.clone().unwrap_or_else(|| "no-trace".to_string());
    log::info!("[API-Unified] Request: {} Provider: {} (Trace: {})", api_name, provider, current_trace_id);
    
    let options = Options {
        params,
        cookie,
        trace_id: trace_id.clone(),
    };
    
    match api::dispatch_unified(&client, &provider, &api_name, options).await {
        Ok(res) => {
            log::info!("[API-Unified] Success: {} (Trace: {})", api_name, current_trace_id);
            Ok(res)
        },
        Err(e) => {
            log::error!("[API-Unified] Failed: {} Error: {} (Trace: {})", api_name, e, current_trace_id);
            Err(e)
        }
    }
}

#[tauri::command]
async fn get_proxy_port(proxy_port: tauri::State<'_, u16>) -> Result<u16, ()> {
    Ok(*proxy_port)
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

            // Spawn the Axum proxy server
            tauri::async_runtime::block_on(async move {
                match proxy::start_proxy_server().await {
                    Ok(port) => {
                        log::info!("Started local audio proxy on port: {}", port);
                        app.manage(port); // Manage the port so frontend can query it
                    }
                    Err(e) => {
                        log::error!("Failed to start local audio proxy: {}", e);
                    }
                }
            });

            println!("[Main] Registering musiclocal:// protocol handler (Temporarily disabled)");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![request_api, request_api_unified, request_bytes, log_info, get_proxy_port])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
