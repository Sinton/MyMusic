use crate::http::{HttpClient, HttpResult, HttpResponse};
use serde_json::json;
use crate::Options;
use super::weapi;

pub async fn account(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    weapi(client, "https://music.163.com/api/nuser/account/get", json!({}), &options).await
}
