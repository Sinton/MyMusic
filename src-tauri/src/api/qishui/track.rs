use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use crate::Options;
use crate::api::netease::parse_params;
use regex::Regex;
use serde_json::Value;

/// Fetch the SSR page for a Qishui track and extract structured data from `_ROUTER_DATA`.
pub async fn detail(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let track_id = params.get("track_id").cloned().unwrap_or_default();

    if track_id.is_empty() {
        return Err(AppError::Api("Missing track_id parameter".to_string()));
    }

    let url = format!(
        "https://music.douyin.com/qishui/share/track?track_id={}",
        track_id
    );

    let trace_id = options.trace_id.clone().unwrap_or_else(|| "no-trace".to_string());
    println!("[Qishui][{}] Fetching track page: {}", trace_id, url);

    // Fetch the HTML page directly
    let html = fetch_html(client, &url).await?;

    // Extract _ROUTER_DATA JSON from the page
    let router_data = extract_router_data(&html)?;

    // Extract track_page data
    let track_page = router_data
        .pointer("/loaderData/track_page")
        .cloned()
        .unwrap_or(Value::Null);

    if track_page.is_null() {
        return Err(AppError::Api("track_page not found in _ROUTER_DATA".to_string()));
    }

    let awo = track_page.pointer("/audioWithLyricsOption");

    // Build a clean response — use correct SSR field paths
    let audio_url = awo
        .and_then(|v| v.pointer("/url"))
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();

    let title = awo
        .and_then(|v| v.pointer("/trackName"))
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();

    let artist = awo
        .and_then(|v| v.pointer("/artistName"))
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();

    // Cover image: prefer ld+json (has complete URL with size suffix),
    // fallback to url_cover assembly
    let cover = {
        let (_, ld_cover) = extract_ld_json(&html);
        if !ld_cover.is_empty() {
            ld_cover
        } else {
            let cover_host = awo
                .and_then(|v| v.pointer("/trackInfo/album/url_cover/urls/0"))
                .and_then(Value::as_str)
                .unwrap_or("");
            let cover_uri = awo
                .and_then(|v| v.pointer("/trackInfo/album/url_cover/uri"))
                .and_then(Value::as_str)
                .unwrap_or("");
            if !cover_host.is_empty() && !cover_uri.is_empty() {
                format!("{}{}~c5_720x720.jpg", cover_host, cover_uri)
            } else {
                String::new()
            }
        }
    };

    let mut album = String::new();
    let mut duration_ms: u64 = 0;
    let mut release_date: i64 = 0;
    let mut bit_rates = Value::Array(Vec::new());
    let mut label_info = Value::Null;
    let mut artist_id = String::new();
    let mut album_id = String::new();

    // Helper to get a JSON value that might be double-encoded as a string
    let get_parsed_json = |val_opt: Option<&Value>| -> Option<Value> {
        if let Some(val) = val_opt {
            if val.is_string() {
                serde_json::from_str::<Value>(val.as_str().unwrap()).ok()
            } else {
                Some(val.clone())
            }
        } else {
            None
        }
    };

    if let Some(track_info_obj) = get_parsed_json(awo.and_then(|v| v.pointer("/trackInfo"))) {
        if let Some(album_obj) = get_parsed_json(track_info_obj.pointer("/album")) {
            album = album_obj
                .pointer("/name")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string();

            release_date = album_obj
                .pointer("/release_date")
                .and_then(Value::as_i64)
                .unwrap_or(0);

            album_id = album_obj
                .pointer("/id")
                .and_then(Value::as_u64)
                .map(|v| v.to_string())
                .or_else(|| album_obj.pointer("/id").and_then(Value::as_str).map(|v| v.to_string()))
                .unwrap_or_default();
        }

        duration_ms = track_info_obj
            .pointer("/duration")
            .and_then(Value::as_u64)
            .unwrap_or(0);

        if let Some(br_arr) = get_parsed_json(track_info_obj.pointer("/bit_rates")) {
            bit_rates = br_arr;
        }

        if let Some(li_obj) = get_parsed_json(track_info_obj.pointer("/label_info")) {
            label_info = li_obj;
        }

        // Extract artist ID from first artist in trackInfo
        if let Some(artists) = track_info_obj.pointer("/artists").and_then(Value::as_array) {
            if let Some(first_artist) = artists.first() {
                if let Some(id_str) = first_artist.pointer("/id_str").and_then(Value::as_str) {
                    artist_id = id_str.to_string();
                } else if let Some(id_val) = first_artist.pointer("/id") {
                    if let Some(id_str) = id_val.as_str() {
                        artist_id = id_str.to_string();
                    } else if let Some(id_u64) = id_val.as_u64() {
                        artist_id = id_u64.to_string();
                    }
                }
            }
        }
    }

    if duration_ms == 0 {
        // Also try the top-level duration
        duration_ms = awo
            .and_then(|v| v.pointer("/duration"))
            .and_then(Value::as_u64)
            .or_else(|| track_page.pointer("/duration").and_then(Value::as_u64))
            .unwrap_or(0);
    }

    let group_playable_level = awo
        .and_then(|v| v.pointer("/group_playable_level"))
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();

    // Fallback ID extraction from top-level track_page or awo if above failed
    if artist_id.is_empty() {
        artist_id = awo
            .and_then(|v| v.pointer("/artistIdStr"))
            .and_then(Value::as_str)
            .or_else(|| track_page.pointer("/artistIdStr").and_then(Value::as_str))
            .unwrap_or("")
            .to_string();
    }

    if album_id.is_empty() {
        album_id = awo
            .and_then(|v| v.pointer("/album_id"))
            .and_then(Value::as_u64)
            .map(|v| v.to_string())
            .or_else(|| track_page.pointer("/album_id").and_then(Value::as_u64).map(|v| v.to_string()))
            .unwrap_or_default();
    }

    let result = serde_json::json!({
        "code": 200,
        "data": {
            "trackId": track_id,
            "title": title,
            "artist": artist,
            "album": album,
            "cover": cover,
            "url": audio_url,
            "durationMs": duration_ms,
            "releaseDate": release_date,
            "bitRates": bit_rates,
            "labelInfo": label_info,
            "groupPlayableLevel": group_playable_level,
            "artistId": artist_id,
            "albumId": album_id,
        }
    });

    println!("[Qishui][{}] Track parsed: {} - {} (url len: {})", trace_id, artist, title, audio_url.len());

    Ok(HttpResponse {
        status: 200,
        body: result,
        headers: std::collections::HashMap::new(),
        raw_body: vec![],
    })
}

/// Fetch raw HTML from a URL using the client's internal reqwest client.
pub(crate) async fn fetch_html(client: &HttpClient, url: &str) -> HttpResult<String> {
    let resp = client
        .internal
        .get(url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
        .header("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
        .send()
        .await
        .map_err(AppError::from)?;

    let status = resp.status().as_u16();
    if status != 200 {
        return Err(AppError::Api(format!("Qishui page returned status {}", status)));
    }

    resp.text().await.map_err(AppError::from)
}

/// Extract the `_ROUTER_DATA` JSON object from `<script>` in the HTML.
pub(crate) fn extract_router_data(html: &str) -> HttpResult<Value> {
    let re = Regex::new(r#"_ROUTER_DATA\s*=\s*(\{[\s\S]*?\});"#)
        .map_err(|e| AppError::Internal(format!("Regex error: {}", e)))?;

    let captures = re
        .captures(html)
        .ok_or_else(|| AppError::Api("_ROUTER_DATA not found in page HTML".to_string()))?;

    let json_str = captures
        .get(1)
        .ok_or_else(|| AppError::Api("_ROUTER_DATA capture group empty".to_string()))?
        .as_str();

    serde_json::from_str::<Value>(json_str)
        .map_err(|e| AppError::Api(format!("Failed to parse _ROUTER_DATA JSON: {}", e)))
}

/// Extract title and cover from `application/ld+json` script tag (fallback).
fn extract_ld_json(html: &str) -> (String, String) {
    let re = Regex::new(
        r#"<script[^>]*type="application/ld\+json"[^>]*>([\s\S]*?)</script>"#,
    );

    if let Ok(re) = re {
        if let Some(caps) = re.captures(html) {
            if let Some(json_str) = caps.get(1) {
                if let Ok(data) = serde_json::from_str::<Value>(json_str.as_str()) {
                    let title = data["title"].as_str().unwrap_or("").to_string();
                    let cover = data["images"]
                        .as_array()
                        .and_then(|arr| arr.first())
                        .and_then(Value::as_str)
                        .unwrap_or("")
                        .to_string();
                    return (title, cover);
                }
            }
        }
    }

    (String::new(), String::new())
}
