use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use serde_json::json;
use crate::Options;
use super::{parse_params, weapi, linuxapi};

pub async fn personalized(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let limit = parsed.get("limit").map(|s| s.as_str()).unwrap_or("30");
    let params = json!({ "limit": limit, "total": "true", "n": "1000" });
    weapi(client, "https://music.163.com/weapi/personalized/playlist", params, &options).await
}

pub async fn album_newest(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    weapi(client, "https://music.163.com/api/discovery/newAlbum", json!({}), &options).await
}

pub async fn album_detail(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let id = parsed.get("id").ok_or(AppError::MissingParam("id".to_string()))?;
    let url = format!("https://music.163.com/weapi/v1/album/{}", id);
    weapi(client, &url, json!({}), &options).await
}

pub async fn toplist(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
     linuxapi(client, "https://music.163.com/api/toplist", json!({}), &options).await
}

pub async fn recommend_resource(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    weapi(client, "https://music.163.com/weapi/v1/discovery/recommend/resource", json!({}), &options).await
}

pub async fn recommend_songs(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = json!({ "total": "true" });
    weapi(client, "https://music.163.com/weapi/v1/discovery/recommend/songs", params, &options).await
}

