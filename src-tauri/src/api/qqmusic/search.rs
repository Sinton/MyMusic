use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::Options;
use serde_json::json;
use crate::api::netease::parse_params;
use super::musicu_request;

pub async fn get(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let keyword_raw = params.get("keyword").cloned().unwrap_or_default();
    
    // Use the URL crate to decode the keyword (%E5... -> raw string)
    // because parse_params doesn't do it. 
    let query_string = format!("k={}", keyword_raw);
    let keyword = url::form_urlencoded::parse(query_string.as_bytes())
        .find(|(k, _)| k == "k")
        .map(|(_, v)| v.into_owned())
        .unwrap_or(keyword_raw.clone());

    println!("[QQMusic] Search keyword: raw='{}' decoded='{}'", keyword_raw, keyword);

    let payload = json!({
        "comm": { "ct": "19", "cv": "1859", "uin": "0" },
        "req": {
            "method": "DoSearchForQQMusicDesktop",
            "module": "music.search.SearchCgiService",
            "param": {
                "grp": 1,
                "num_per_page": 30,
                "page_num": 1,
                "query": keyword,
                "search_type": 0
            }
        }
    });

    musicu_request(client, payload, &options.cookie, options.trace_id.clone()).await
}
