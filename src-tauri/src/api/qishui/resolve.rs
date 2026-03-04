use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use crate::Options;
use crate::api::netease::parse_params;
use regex::Regex;
use serde_json::json;

/// Resolve a Qishui share link (short or full) into a track_id,
/// then fetch the full track detail.
///
/// Supported input formats:
///   - https://qishui.douyin.com/s/i9WqxYx9/
///   - https://music.douyin.com/qishui/share/track?track_id=123456
///   - Raw track_id string
pub async fn resolve(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let url_raw = params.get("url").cloned().unwrap_or_default();
    // Decode URL-encoded value from frontend's encodeURIComponent
    let url = url::form_urlencoded::parse(format!("u={}", url_raw).as_bytes())
        .find(|(k, _)| k == "u")
        .map(|(_, v)| v.into_owned())
        .unwrap_or(url_raw);

    if url.is_empty() {
        return Err(AppError::Api("Missing url parameter".to_string()));
    }

    let trace_id = options.trace_id.clone().unwrap_or_else(|| "no-trace".to_string());
    println!("[Qishui][{}] Resolving share link: {}", trace_id, url);

    let track_id = extract_track_id(client, &url).await?;
    println!("[Qishui][{}] Resolved track_id: {}", trace_id, track_id);

    // Reuse the existing track::detail logic
    let detail_options = Options {
        params: format!("track_id={}", track_id),
        cookie: options.cookie,
        trace_id: options.trace_id,
    };

    super::track::detail(client, detail_options).await
}

/// Extract track_id from various URL formats.
/// If the URL is a short link (qishui.douyin.com/s/...), follow the 302 redirect first.
async fn extract_track_id(client: &HttpClient, url: &str) -> HttpResult<String> {
    let track_id_re = Regex::new(r"track_id=(\d+)")
        .map_err(|e| AppError::Internal(format!("Regex error: {}", e)))?;

    // Case 1: URL already contains track_id
    if let Some(caps) = track_id_re.captures(url) {
        return Ok(caps.get(1).unwrap().as_str().to_string());
    }

    // Case 2: Pure numeric string (raw track_id)
    if url.chars().all(|c| c.is_ascii_digit()) && !url.is_empty() {
        return Ok(url.to_string());
    }

    // Case 3: Short link — follow redirect WITHOUT auto-following,
    // just read the Location header.
    if url.contains("qishui.douyin.com") || url.contains("douyin.com/s/") {
        let redirect_url = follow_redirect(client, url).await?;
        if let Some(caps) = track_id_re.captures(&redirect_url) {
            return Ok(caps.get(1).unwrap().as_str().to_string());
        }
        return Err(AppError::Api(format!(
            "Redirected URL does not contain track_id: {}",
            redirect_url
        )));
    }

    Err(AppError::Api(format!("Cannot extract track_id from: {}", url)))
}

/// Follow a 302 redirect manually to get the final Location URL.
/// We build a separate client that does NOT auto-follow redirects.
async fn follow_redirect(_client: &HttpClient, url: &str) -> HttpResult<String> {
    // Build a one-off client that does not follow redirects
    let no_redirect_client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| AppError::Internal(format!("Failed to build redirect client: {}", e)))?;

    let resp = no_redirect_client
        .get(url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .send()
        .await
        .map_err(AppError::from)?;

    let status = resp.status().as_u16();
    println!("[Qishui] Short link response status: {}", status);

    if status == 301 || status == 302 || status == 303 || status == 307 || status == 308 {
        if let Some(location) = resp.headers().get("location") {
            let loc_str = location
                .to_str()
                .map_err(|_| AppError::Api("Invalid Location header encoding".to_string()))?;
            println!("[Qishui] Redirect Location: {}", loc_str);
            return Ok(loc_str.to_string());
        }
    }

    // If no redirect, maybe it resolved directly — check the final URL
    let final_url = resp.url().to_string();
    println!("[Qishui] No redirect, final URL: {}", final_url);
    Ok(final_url)
}

/// Quick check: does a string look like a Qishui/Douyin music share link?
/// Used by the frontend to decide whether to show the clipboard toast.
pub fn is_qishui_link(url: &str) -> bool {
    url.contains("qishui.douyin.com")
        || (url.contains("music.douyin.com") && url.contains("track"))
}

/// Extract an HTTP(S) URL from mixed text that may contain Chinese characters,
/// song titles, etc. E.g. "《咏春》@汽水音乐 https://qishui.douyin.com/s/xxx/"
/// Returns the extracted URL, or the original text if no URL pattern is found.
fn extract_url_from_text(text: &str) -> String {
    let url_re = Regex::new(r"https?://[^\s\x{3000}\x{300a}\x{300b}\x{3001}\x{ff0c}]+")
        .unwrap_or_else(|_| Regex::new(r"https?://\S+").unwrap());
    if let Some(m) = url_re.find(text) {
        m.as_str().to_string()
    } else {
        text.trim().to_string()
    }
}

/// Validate a URL and return basic info without fetching the full track.
pub async fn validate(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let url_raw = params.get("url").cloned().unwrap_or_default();
    // Decode URL-encoded value from frontend's encodeURIComponent
    let decoded = url::form_urlencoded::parse(format!("u={}", url_raw).as_bytes())
        .find(|(k, _)| k == "u")
        .map(|(_, v)| v.into_owned())
        .unwrap_or(url_raw);

    // Extract the actual URL from mixed text (e.g. "《歌名》@汽水音乐 https://qishui.douyin.com/s/xxx/")
    let url = extract_url_from_text(&decoded);

    if url.is_empty() || !is_qishui_link(&url) {
        return Ok(HttpResponse {
            status: 200,
            body: json!({ "code": 200, "data": { "isQishuiLink": false } }),
            headers: std::collections::HashMap::new(),
        });
    }

    let trace_id = options.trace_id.clone().unwrap_or_else(|| "no-trace".to_string());
    println!("[Qishui][{}] Validating link: {}", trace_id, url);

    match extract_track_id(client, &url).await {
        Ok(track_id) => Ok(HttpResponse {
            status: 200,
            body: json!({
                "code": 200,
                "data": {
                    "isQishuiLink": true,
                    "trackId": track_id,
                    "originalUrl": url,
                }
            }),
            headers: std::collections::HashMap::new(),
        }),
        Err(_) => Ok(HttpResponse {
            status: 200,
            body: json!({ "code": 200, "data": { "isQishuiLink": false } }),
            headers: std::collections::HashMap::new(),
        }),
    }
}
