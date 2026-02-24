use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use serde_json::json;
use crate::Options;
use super::{parse_params, weapi};

pub async fn qr_key(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    weapi(client, "https://music.163.com/weapi/login/qrcode/unikey", json!({ "type": "3" }), &options).await
}

pub async fn qr_create(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let codekey = parsed.get("key").ok_or(AppError::MissingParam("key".to_string()))?;
    let url = format!("https://music.163.com/login?codekey={}", codekey);
    weapi(client, &url, json!({}), &options).await
}

pub async fn qr_check(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let key = parsed.get("key").ok_or(AppError::MissingParam("key".to_string()))?;
    let params = json!({ "type": "3", "key": key, "noCheckToken": "true" });
    weapi(client, "https://music.163.com/weapi/login/qrcode/client/login", params, &options).await
}

pub async fn status(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    weapi(client, "https://music.163.com/weapi/w/nuser/account/get", json!({}), &options).await
}

pub async fn refresh(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    weapi(client, "https://music.163.com/weapi/login/token/refresh", json!({}), &options).await
}

pub async fn logout(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    weapi(client, "https://music.163.com/weapi/logout", json!({}), &options).await
}
