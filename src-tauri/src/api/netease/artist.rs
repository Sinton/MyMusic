use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use serde_json::json;
use crate::Options;
use super::{parse_params, weapi, linuxapi};

pub async fn detail(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let id_str = parsed.get("id").ok_or(AppError::MissingParam("id".to_string()))?;
    let id = id_str.parse::<i64>().unwrap_or(0);
    
    let params = json!({ "id": id });
    weapi(client, "https://music.163.com/weapi/artist/head/info/get", params, &options).await
}

pub async fn songs(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let id_str = parsed.get("id").ok_or(AppError::MissingParam("id".to_string()))?;
    let id = id_str.parse::<i64>().unwrap_or(0);
    
    let params = json!({ 
        "id": id, 
        "private_cloud": "true", 
        "work_type": 1, 
        "order": "hot", 
        "offset": 0, 
        "limit": 100 
    });
    linuxapi(client, "https://music.163.com/api/v1/artist/top/song", params, &options).await
}

pub async fn albums(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let id_str = parsed.get("id").ok_or(AppError::MissingParam("id".to_string()))?;
    let id = id_str.parse::<i64>().unwrap_or(0);
    let limit = parsed.get("limit").map(|s| s.as_str()).unwrap_or("30");
    let offset = parsed.get("offset").map(|s| s.as_str()).unwrap_or("0");
    let url = format!("https://music.163.com/weapi/artist/albums/{}", id);
    let params = json!({ "limit": limit, "offset": offset, "total": true });
    weapi(client, &url, params, &options).await
}
