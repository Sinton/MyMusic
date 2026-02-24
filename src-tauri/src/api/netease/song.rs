use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use serde_json::json;
use crate::Options;
use super::{parse_params, weapi, eapi, linuxapi};

pub async fn url_v1(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let id = parsed.get("id").ok_or(AppError::MissingParam("id".to_string()))?;
    let level = parsed.get("level").map(|s| s.as_str()).unwrap_or("standard");
    
    let id_int = id.parse::<i64>().unwrap_or(0);
    
    let mut params = json!({
        "ids": vec![id_int],
        "encodeType": "mp3",
        "level": level
    });
    if level == "sky" {
        params["immerseType"] = json!("c51");
    }

    // Custom cookies still needed for this specific one due to extra fields
    // But we can still use eapi helper if we append cookies before?
    // Actually the eapi helper creates standard cookies.
    // Let's just use eapi helper and see if it works, or keep this one slightly manual if absolutely necessary.
    // Netease APIs are picky.
    
    eapi(client, "https://interface.music.163.com/eapi/song/enhance/player/url/v1", params, "/api/song/enhance/player/url/v1", &options).await
}

pub async fn detail(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let ids = parsed.get("ids").ok_or(AppError::MissingParam("ids".to_string()))?;
    let params = json!({
        "c": format!("[{{\"id\":{}}}]", ids),
        "ids": format!("[{}]", ids)
    });
    weapi(client, "https://music.163.com/weapi/v3/song/detail", params, &options).await
}

pub async fn lyric(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let id = parsed.get("id").ok_or(AppError::MissingParam("id".to_string()))?;
    linuxapi(client, "https://music.163.com/weapi/song/lyric?lv=-1&kv=-1&tv=-1", json!({"id": id}), &options).await
}
pub async fn url(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let id = parsed.get("id").ok_or(AppError::MissingParam("id".to_string()))?;
    let br = parsed.get("br").map(|s| s.as_str()).unwrap_or("320000");
    
    let id_int = id.parse::<i64>().unwrap_or(0);
    let params = json!({
        "ids": vec![id_int],
        "br": br.parse::<i64>().unwrap_or(320000)
    });
    weapi(client, "https://music.163.com/weapi/song/enhance/player/url", params, &options).await
}
