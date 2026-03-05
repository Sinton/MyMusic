use axum::{
    extract::Query,
    response::IntoResponse,
    routing::get,
    Router,
};
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
