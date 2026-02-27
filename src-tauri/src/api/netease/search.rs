use crate::http::{HttpClient, HttpResult, HttpResponse};
use serde_json::json;
use crate::Options;
use super::{parse_params, weapi};

pub async fn get(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let parsed = parse_params(&options.params);
    let params = json!({
        "s": parsed.get("keywords").unwrap_or(&"".to_string()),
        "type": parsed.get("type").unwrap_or(&"1".to_string()),
        "limit": parsed.get("limit").unwrap_or(&"30".to_string()),
        "offset": parsed.get("offset").unwrap_or(&"0".to_string())
    });
    weapi(client, "https://music.163.com/weapi/cloudsearch/get/web", params, &options).await
}
