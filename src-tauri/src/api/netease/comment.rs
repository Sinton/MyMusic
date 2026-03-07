use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use serde_json::json;
use crate::Options;
use super::{parse_params, linuxapi};

pub async fn song_comments(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let id = parsed.get("songId").ok_or(AppError::MissingParam("songId".to_string()))?;
    let limit = parsed.get("limit").map(|s| s.as_str()).unwrap_or("20");
    let offset = parsed.get("offset").map(|s| s.as_str()).unwrap_or("0");
    let before_time = parsed.get("beforeTime").map(|s| s.as_str()).unwrap_or("0");

    let params = json!({
        "rid": id,
        "limit": limit,
        "offset": offset,
        "beforeTime": before_time
    });

    let url = format!("https://music.163.com/api/v1/resource/comments/R_SO_4_{}", id);
    linuxapi(client, &url, params, &options).await
}

pub async fn song_hot_comments(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let id = parsed.get("songId").ok_or(AppError::MissingParam("songId".to_string()))?;
    let limit = parsed.get("limit").map(|s| s.as_str()).unwrap_or("20");
    let offset = parsed.get("offset").map(|s| s.as_str()).unwrap_or("0");

    let params = json!({
        "rid": id,
        "limit": limit,
        "offset": offset,
        "type": 0 // 0 means song
    });

    let url = format!("https://music.163.com/api/v1/resource/hotcomments/R_SO_4_{}", id);
    linuxapi(client, &url, params, &options).await
}
