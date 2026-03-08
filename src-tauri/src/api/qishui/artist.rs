use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use crate::Options;
use crate::api::netease::parse_params;
use serde_json::{json, Value};
use super::track::{fetch_html, extract_router_data};

/// Fetch the SSR page for a Qishui artist and extract structured data.
/// URL: https://music.douyin.com/qishui/share/artist?artist_id={artist_id}
pub async fn detail(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let artist_id = params.get("artist_id").cloned().unwrap_or_default();

    if artist_id.is_empty() {
        return Err(AppError::Api("Missing artist_id parameter".to_string()));
    }

    let url = format!(
        "https://music.douyin.com/qishui/share/artist?artist_id={}",
        artist_id
    );

    let trace_id = options.trace_id.clone().unwrap_or_else(|| "no-trace".to_string());
    println!("[Qishui][{}] Fetching artist page: {}", trace_id, url);

    let html = fetch_html(client, &url).await?;
    let router_data = extract_router_data(&html)?;

    let artist_page = router_data
        .pointer("/loaderData/artist_page")
        .cloned()
        .unwrap_or(Value::Null);

    if artist_page.is_null() {
        return Err(AppError::Api("artist_page not found in _ROUTER_DATA".to_string()));
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

    // Extract artist info
    let artist_info = parse_json(artist_page.pointer("/artistInfo"));
    let name = artist_info.pointer("/name").and_then(Value::as_str).unwrap_or("").to_string();
    let id = artist_info.pointer("/id").and_then(Value::as_str).unwrap_or("").to_string();
    let count_albums = artist_info.pointer("/count_albums").and_then(Value::as_u64).unwrap_or(0);
    let count_tracks = artist_info.pointer("/count_tracks").and_then(Value::as_u64).unwrap_or(0);

    // Avatar URL
    let avatar = {
        let host = artist_info.pointer("/url_avatar/urls/0").and_then(Value::as_str).unwrap_or("");
        let uri = artist_info.pointer("/url_avatar/uri").and_then(Value::as_str).unwrap_or("");
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

    // Artist profile/bio
    let profile = artist_info.pointer("/artist_profile").cloned().unwrap_or(Value::Null);

    // Stats
    let stats = artist_info.pointer("/stats").cloned().unwrap_or(Value::Null);

    // Track list - format covers and duration
    let mut tracks = Vec::new();
    if let Some(tl) = artist_page.pointer("/trackList").and_then(Value::as_array) {
        for t in tl {
            let mut track_map = t.as_object().cloned().unwrap_or_default();
            let cover = get_full_cover(t.pointer("/album/url_cover"))
                .or_else(|| get_full_cover(t.pointer("/url_cover")))
                .unwrap_or_default();
            track_map.insert("cover".to_string(), json!(cover));
            
            // Extract duration (ms)
            let duration = t.pointer("/duration").and_then(Value::as_u64).unwrap_or(0);
            track_map.insert("duration_ms".to_string(), json!(duration));
            
            tracks.push(json!(track_map));
        }
    }

    // Album list - format covers
    let mut albums = Vec::new();
    if let Some(al) = artist_page.pointer("/albumList").and_then(Value::as_array) {
        for a in al {
            let mut album_map = a.as_object().cloned().unwrap_or_default();
            let cover = get_full_cover(a.pointer("/url_cover")).unwrap_or_default();
            album_map.insert("cover".to_string(), json!(cover));
            albums.push(json!(album_map));
        }
    }

    let result = json!({
        "code": 200,
        "data": {
            "artistId": id,
            "name": name,
            "avatar": avatar,
            "countAlbums": count_albums,
            "countTracks": count_tracks,
            "profile": profile,
            "stats": stats,
            "trackList": tracks,
            "albumList": albums,
        }
    });

    println!("[Qishui][{}] Artist parsed: {} (tracks: {}, albums: {})", trace_id, name, count_tracks, count_albums);

    Ok(HttpResponse {
        status: 200,
        headers: std::collections::HashMap::new(),
        body: result,
        raw_body: vec![],
    })
}
