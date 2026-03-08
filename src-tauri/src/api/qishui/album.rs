use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use crate::Options;
use crate::api::netease::parse_params;
use serde_json::{json, Value};
use super::track::{fetch_html, extract_router_data};

/// Fetch the SSR page for a Qishui album and extract structured data.
/// URL: https://music.douyin.com/qishui/share/album?album_id={album_id}
pub async fn detail(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let album_id = params.get("album_id").cloned().unwrap_or_default();

    if album_id.is_empty() {
        return Err(AppError::Api("Missing album_id parameter".to_string()));
    }

    let url = format!(
        "https://music.douyin.com/qishui/share/album?album_id={}",
        album_id
    );

    let trace_id = options.trace_id.clone().unwrap_or_else(|| "no-trace".to_string());
    println!("[Qishui][{}] Fetching album page: {}", trace_id, url);

    let html = fetch_html(client, &url).await?;
    let router_data = extract_router_data(&html)?;

    let album_page = router_data
        .pointer("/loaderData/album_page")
        .cloned()
        .unwrap_or(Value::Null);

    if album_page.is_null() {
        return Err(AppError::Api("album_page not found in _ROUTER_DATA".to_string()));
    }

    // Helper: parse possibly double-encoded JSON
    let parse_json = |val: Option<&Value>| -> Value {
        if let Some(v) = val {
            if v.is_string() {
                serde_json::from_str::<Value>(v.as_str().unwrap()).unwrap_or(v.clone())
            } else {
                v.clone()
            }
        } else {
            Value::Null
        }
    };

    // Extract album info
    let album_info = parse_json(album_page.pointer("/albumInfo"));
    let name = album_info.pointer("/name").and_then(Value::as_str).unwrap_or("").to_string();
    let id = album_info.pointer("/id").and_then(Value::as_str).unwrap_or("").to_string();
    let count_tracks = album_info.pointer("/count_tracks").and_then(Value::as_u64).unwrap_or(0);
    let release_date = album_info.pointer("/release_date").and_then(Value::as_i64).unwrap_or(0);

    // Cover URL
    let cover = {
        let host = album_info.pointer("/url_cover/urls/0").and_then(Value::as_str).unwrap_or("");
        let uri = album_info.pointer("/url_cover/uri").and_then(Value::as_str).unwrap_or("");
        if !host.is_empty() && !uri.is_empty() {
            format!("{}{}~c5_720x720.jpg", host, uri)
        } else {
            String::new()
        }
    };

    // Helper: compute full cover URL from url_cover object
    let get_full_cover = |obj: Option<&Value>| -> Option<String> {
        if let Some(c) = obj {
            let host = c.pointer("/urls/0").and_then(Value::as_str).unwrap_or("");
            let uri = c.pointer("/uri").and_then(Value::as_str).unwrap_or("");
            if !host.is_empty() && !uri.is_empty() {
                return Some(format!("{}{}~c5_720x720.jpg", host, uri));
            }
        }
        None
    };

    // Artists
    let artists = parse_json(album_info.pointer("/artists"));

    // Stats
    let stats = album_info.pointer("/stats").cloned().unwrap_or(Value::Null);

    // Track list - format covers
    let mut tracks = Vec::new();
    if let Some(tl) = album_page.pointer("/trackList").and_then(Value::as_array) {
        for t in tl {
            let mut track_map = t.as_object().cloned().unwrap_or_default();
            // In album page, tracks usually have url_cover or album.url_cover
            let track_cover = get_full_cover(t.pointer("/album/url_cover"))
                .or_else(|| get_full_cover(t.pointer("/url_cover")))
                .unwrap_or_else(|| cover.clone());
            track_map.insert("cover".to_string(), json!(track_cover));
            
            // Extract duration (ms)
            let duration = t.pointer("/duration").and_then(Value::as_u64).unwrap_or(0);
            track_map.insert("duration_ms".to_string(), json!(duration));
            
            tracks.push(json!(track_map));
        }
    }

    let result = json!({
        "code": 200,
        "data": {
            "albumId": id,
            "name": name,
            "cover": cover,
            "countTracks": count_tracks,
            "releaseDate": release_date,
            "artists": artists,
            "stats": stats,
            "trackList": tracks,
        }
    });

    println!("[Qishui][{}] Album parsed: {} (tracks: {})", trace_id, name, count_tracks);

    Ok(HttpResponse {
        status: 200,
        headers: std::collections::HashMap::new(),
        body: result,
        raw_body: vec![],
    })
}
