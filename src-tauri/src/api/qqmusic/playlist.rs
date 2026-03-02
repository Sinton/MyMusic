use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::Options;
use serde_json::json;
use crate::api::netease::parse_params;
use super::musicu_request;

pub async fn user(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let uin = params.get("uin").cloned().unwrap_or_else(|| "0".to_string());
    let uin_val = uin.parse::<i64>().unwrap_or(0);
    
    let payload = json!({
        "comm": { "ct": 24, "cv": 0 },
        "req": {
            "module": "music.UserDissInfo.UserDissInfoServer",
            "method": "GetDissList",
            "param": { "uin": uin_val, "host_uin": uin_val, "sin": 0, "size": 40 }
        }
    });

    musicu_request(client, payload, &options.cookie).await
}
