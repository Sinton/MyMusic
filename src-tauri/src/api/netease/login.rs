use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use serde_json::json;
use crate::Options;
use super::{parse_params, weapi, weapi_without_cookie};

pub async fn qr_key(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    weapi_without_cookie(client, "https://music.163.com/weapi/login/qrcode/unikey", json!({ "type": "3" }), &options).await
}

pub async fn qr_create(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let codekey = parsed.get("key").ok_or(AppError::MissingParam("key".to_string()))?;
    
    // Correct endpoint for WeAPI QR image creation.
    weapi_without_cookie(
        client, 
        "https://music.163.com/weapi/login/qrcode/create", 
        json!({ "key": codekey, "qrimg": "true" }), 
        &options
    ).await
}

pub async fn qr_init_combined(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    // 1. Get Key
    let key_resp = qr_key(client, options.clone()).await?;
    let unikey = key_resp.body["unikey"].as_str().ok_or(AppError::Api("Failed to get unikey".into()))?;
    
    // 2. Create QR image
    let mut create_options = options;
    create_options.params = format!("key={}", unikey);
    let mut qr_resp = qr_create(client, create_options).await?;
    
    // Inject the unikey for mapper
    if let Some(obj) = qr_resp.body.as_object_mut() {
        obj.insert("unikey".to_string(), json!(unikey));
    }
    
    Ok(qr_resp)
}

pub async fn qr_check(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let key = parsed.get("auth_id")
        .or(parsed.get("unikey"))
        .or(parsed.get("key"))
        .ok_or(AppError::MissingParam("auth_id".to_string()))?;
    
    // Standard params for check
    let params = json!({ 
        "type": "3", 
        "key": key 
    });
    
    // Back to weapi_without_cookie to ensure NO COOKIES are sent during poll,
    // which is often required to avoid 8821/403.
    let resp = weapi_without_cookie(client, "https://music.163.com/weapi/login/qrcode/client/login", params, &options).await?;
    
    // Debug log
    let body_str = serde_json::to_string(&resp.body).unwrap_or_else(|_| "{}".to_string());
    println!("[QR CHECK DEBUG][netease] status: {}, body: {}", resp.status, body_str);
    
    Ok(resp)
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
