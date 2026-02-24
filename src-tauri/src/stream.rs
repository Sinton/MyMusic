use tauri::http::{Request, Response};
use tauri::AppHandle;
use reqwest::blocking::Client;
use std::sync::OnceLock;
use std::collections::HashMap;
use url::Url;

static CLIENT: OnceLock<Client> = OnceLock::new();

pub fn get_client() -> &'static Client {
    CLIENT.get_or_init(|| {
        Client::builder()
            .build()
            .unwrap_or_else(|_| Client::new())
    })
}

pub fn handle_stream_protocol<R: tauri::Runtime>(
    _ctx: tauri::UriSchemeContext<'_, R>,
    request: Request<Vec<u8>>,
) -> Response<Vec<u8>> {
    println!("[Stream] GOT REQUEST: {}", request.uri());
    {
        use std::fs::OpenOptions;
        use std::io::Write;
        let mut file = OpenOptions::new().create(true).append(true).open("debug.log").unwrap();
        writeln!(file, "[Stream] GOT REQUEST: {}", request.uri()).unwrap();
    }
    
    let uri = request.uri().to_string();
    
    // Handle OPTIONS for CORS preflight
    if request.method() == "OPTIONS" {
        return Response::builder()
            .status(200)
            .header("Access-Control-Allow-Origin", "*")
            .header("Access-Control-Allow-Methods", "GET, OPTIONS")
            .header("Access-Control-Allow-Headers", "*")
            .body(Vec::new())
            .unwrap();
    }
    {
        use std::fs::OpenOptions;
        use std::io::Write;
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open("debug.log")
            .unwrap();
        writeln!(file, "[Stream] Proxying: {}", uri).unwrap();
    }
    println!("[Stream] Proxying: {}", uri);
    
    // We expect uri to be "music://localhost/?url=https%3A%2F%2F..."
    let parsed_url = match Url::parse(&uri) {
        Ok(u) => u,
        Err(_) => {
            return Response::builder()
                .status(400)
                .body(Vec::new())
                .unwrap();
        }
    };
    
    let query_pairs: HashMap<_, _> = parsed_url.query_pairs().into_owned().collect();
    
    let real_url = match query_pairs.get("link") {
        Some(u) => u.to_string(),
        None => {
            return Response::builder()
                .status(400)
                .body(Vec::new())
                .unwrap();
        }
    };

    let client = get_client();
    let range_header = request.headers().get("range").and_then(|v| v.to_str().ok());

    let mut req_builder = client.get(&real_url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .header("Referer", "https://music.163.com/")
        .header("Origin", "https://music.163.com/");
    
    if let Some(range) = range_header {
        req_builder = req_builder.header("Range", range);
    }

    let match_resp = req_builder.send();

    match match_resp {
        Ok(resp) => {
            let status = resp.status().as_u16();
            let headers = resp.headers().clone();
            
            println!("[Stream] Netease responded with status: {}", status);

            let content_type = headers
                .get(reqwest::header::CONTENT_TYPE)
                .and_then(|v| v.to_str().ok())
                .unwrap_or("audio/mpeg")
                .to_string();
            
            println!("[Stream] Content-Type: {}", content_type);
            
            let content_range = headers
                .get(reqwest::header::CONTENT_RANGE)
                .and_then(|v| v.to_str().ok())
                .map(|v| v.to_string());

            let content_length = headers
                .get(reqwest::header::CONTENT_LENGTH)
                .and_then(|v| v.to_str().ok())
                .map(|v| v.to_string());

            // Read bytes into memory
            let bytes = match resp.bytes() {
                Ok(b) => b.to_vec(),
                Err(_) => Vec::new(),
            };
            
            let mut builder = Response::builder()
                .status(status)
                .header("Content-Type", content_type)
                .header("Access-Control-Allow-Origin", "*")
                .header("Accept-Ranges", "bytes");

            if let Some(cr) = content_range {
                builder = builder.header("Content-Range", cr);
            }
            if let Some(cl) = content_length {
                builder = builder.header("Content-Length", cl);
            }
            
            builder.body(bytes).unwrap()
        },
        Err(e) => {
            log::error!("Stream proxy error: {}", e);
            Response::builder()
                .status(500)
                .body(Vec::new())
                .unwrap()
        }
    }
}
