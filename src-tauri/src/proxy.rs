use axum::{
    extract::Query,
    response::IntoResponse,
    routing::get,
    Router,
};
use tokio::io::AsyncReadExt;
use hyper::{body::Body, HeaderMap, Request, StatusCode};
use reqwest::Client;
use serde::Deserialize;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone)]
pub struct AppState {
    pub client: Client,
}

#[derive(Deserialize)]
pub struct ProxyQuery {
    url: String,
    referer: Option<String>,
}

#[derive(Deserialize)]
pub struct CoverQuery {
    path: String,
}

pub async fn start_proxy_server() -> Result<u16, Box<dyn std::error::Error>> {
    let client = Client::builder()
        .build()?;
        
    let state = Arc::new(AppState { client });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .expose_headers(Any);

    let app = Router::new()
        .route("/proxy", get(proxy_handler))
        .route("/cover", get(cover_handler))
        .layer(cors)
        .with_state(state);

    // Bind to any available port on localhost
    let listener = TcpListener::bind("127.0.0.1:0").await?;
    let local_addr = listener.local_addr()?;
    let port = local_addr.port();
    
    println!("[Axum Proxy] Server listening on http://{}", local_addr);

    // Spawn server in background
    tokio::spawn(async move {
        if let Err(e) = axum::serve(listener, app).await {
            log::error!("[Axum Proxy] Server error: {}", e);
        }
    });

    Ok(port)
}

async fn proxy_handler(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Query(query): Query<ProxyQuery>,
    mut headers: HeaderMap,
) -> impl IntoResponse {
    let target_url = query.url;

    // Detect if this is a local file path
    let is_local = if target_url.starts_with("http") || target_url.starts_with("https") {
        false
    } else {
        std::path::Path::new(&target_url).is_file()
    };

    if is_local {
        match tokio::fs::File::open(&target_url).await {
            Ok(mut file) => {
                let file_size = match file.metadata().await {
                    Ok(m) => m.len(),
                    Err(e) => {
                        log::error!("[Axum Proxy] Error getting metadata for {}: {}", target_url, e);
                        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to get file metadata: {}", e)).into_response();
                    }
                };
                let mime = mime_guess::from_path(&target_url).first_or_octet_stream();
                
                let range_header = headers.get("range").and_then(|v| v.to_str().ok());
                
                let mut response_headers = HeaderMap::new();
                response_headers.insert("content-type", mime.to_string().parse().unwrap());
                response_headers.insert("accept-ranges", "bytes".parse().unwrap());

                if let Some(range_val) = range_header {
                    if let Ok(range) = http_range::HttpRange::parse(range_val, file_size) {
                        if !range.is_empty() {
                            let r = &range[0];
                            use std::io::SeekFrom;
                            use tokio::io::AsyncSeekExt;
                            
                            if file.seek(SeekFrom::Start(r.start)).await.is_ok() {
                                let stream = tokio_util::io::ReaderStream::with_capacity(file.take(r.length), 64 * 1024);
                                let body = axum::body::Body::from_stream(stream);
                                
                                response_headers.insert("content-range", format!("bytes {}-{}/{}", r.start, r.start + r.length - 1, file_size).parse().unwrap());
                                response_headers.insert("content-length", r.length.to_string().parse().unwrap());
                                
                                return (StatusCode::PARTIAL_CONTENT, response_headers, body).into_response();
                            }
                        }
                    }
                }

                // Default: full file
                let stream = tokio_util::io::ReaderStream::new(file);
                let body = axum::body::Body::from_stream(stream);
                response_headers.insert("content-length", file_size.to_string().parse().unwrap());
                
                return (StatusCode::OK, response_headers, body).into_response();
            }
            Err(e) => {
                log::error!("[Axum Proxy] Error opening local file {}: {}", target_url, e);
                return (StatusCode::NOT_FOUND, format!("Local file not found: {}", e)).into_response();
            }
        }
    }

    // Filter out host headers and other local-specific headers from the incoming request
    let headers_to_forward = [
        "range",
        "accept",
        "accept-language",
        "user-agent",
    ];

    let mut req_builder = state.client.get(&target_url);

    // Forward requested headers
    for &h in &headers_to_forward {
        if let Some(val) = headers.get(h) {
            req_builder = req_builder.header(h, val.clone());
        }
    }

    // Default User-Agent if not provided
    if !headers.contains_key("user-agent") {
        req_builder = req_builder.header(
            "user-agent", 
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );
    }

    // Use referer from query if specified (critical for Netease/QQ)
    if let Some(ref_val) = query.referer {
        req_builder = req_builder.header("referer", ref_val);
    } else {
        // Fallback for Netease
        req_builder = req_builder.header("referer", "https://music.163.com/");
    }

    match req_builder.send().await {
        Ok(resp) => {
            let status = resp.status();
            let mut response_headers = HeaderMap::new();

            // Headers we want to forward back to the audio player
            let headers_to_return = [
                "content-type",
                "content-length",
                "content-range",
                "accept-ranges",
                "date",
                "cache-control",
            ];

            for &h in &headers_to_return {
                if let Some(val) = resp.headers().get(h) {
                    response_headers.insert(h, val.clone());
                }
            }
            
            // Ensure Accept-Ranges is present for audio seeking
            if !response_headers.contains_key("accept-ranges") {
                response_headers.insert("accept-ranges", "bytes".parse().unwrap());
            }

            // Always allow CORS for images/audio coming through proxy
            response_headers.insert("access-control-allow-origin", "*".parse().unwrap());

            // Stream the body using reqwest stream feature
            // We convert the reqwest Bytes stream directly into an axum Body
            let stream = resp.bytes_stream();
            let body = axum::body::Body::from_stream(stream);

            (status, response_headers, body).into_response()
        }
        Err(e) => {
            log::error!("[Axum Proxy] Error fetching {}: {}", target_url, e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to proxy request: {}", e),
            ).into_response()
        }
    }
}

async fn cover_handler(
    Query(query): Query<CoverQuery>,
) -> impl IntoResponse {
    let target_path = query.path;

    // Use lofty to extract the picture directly
    let cover_data = tokio::task::spawn_blocking(move || {
        use lofty::prelude::*;
        use lofty::probe::Probe;
        use std::path::Path;

        let path = Path::new(&target_path);
        if !path.exists() {
            return Err("File does not exist".to_string());
        }

        let tagged_file = match Probe::open(path).and_then(|p| p.read()) {
            Ok(t) => t,
            Err(e) => return Err(format!("Failed to probe file: {}", e)),
        };

        let tag = tagged_file.primary_tag().or_else(|| tagged_file.first_tag());
        if let Some(t) = tag {
            if let Some(pic) = t.pictures().first() {
                let bytes = pic.data().to_vec();
                let mime = pic.mime_type().map(|m| m.to_string()).unwrap_or_else(|| "image/jpeg".to_string());
                return Ok((bytes, mime));
            }
        }
        
        Err("No embedded cover found".to_string())
    }).await.unwrap_or_else(|e| Err(format!("Task panic: {}", e)));

    match cover_data {
        Ok((bytes, mime)) => {
            let mut response_headers = HeaderMap::new();
            response_headers.insert("content-type", mime.parse().unwrap());
            response_headers.insert("content-length", bytes.len().to_string().parse().unwrap());
            response_headers.insert("access-control-allow-origin", "*".parse().unwrap());
            
            (StatusCode::OK, response_headers, axum::body::Body::from(bytes)).into_response()
        }
        Err(e) => {
            // Return 404 or a fallback transparent PNG. For simplicity, just return 404.
            (StatusCode::NOT_FOUND, e).into_response()
        }
    }
}
