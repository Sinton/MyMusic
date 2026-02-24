use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use serde_json::json;
use crate::Options;
use super::{parse_params, weapi, linuxapi};

pub async fn user(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let uid = parsed.get("uid").ok_or(AppError::MissingParam("uid".to_string()))?;
    let limit = parsed.get("limit").unwrap_or(&"30".to_string()).to_string();
    let offset = parsed.get("offset").unwrap_or(&"0".to_string()).to_string();
    
    let params = json!({
        "uid": uid,
        "limit": limit,
        "offset": offset
    });
    weapi(client, "https://music.163.com/weapi/user/playlist", params, &options).await
}

pub async fn detail(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let id = parsed.get("id").ok_or(AppError::MissingParam("id".to_string()))?;
    let s = parsed.get("s").unwrap_or(&"8".to_string()).to_string();
    
    let params = json!({
        "id": id,
        "n": "100000",
        "s": s
    });
    
    linuxapi(client, "https://music.163.com/api/v6/playlist/detail", params, &options).await
}
