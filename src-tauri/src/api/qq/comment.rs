use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::Options;
use serde_json::json;
use crate::api::netease::parse_params;
use super::musicu_request;

/// Module to handle QQ Music comments
/// Using RPC (musicu) for fetching comments

pub async fn get(client: &HttpClient, options: Options, sort: i32) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let mut biz_id = params.get("id").cloned().unwrap_or_default();
    let limit = params.get("limit").and_then(|l| l.parse::<i32>().ok()).unwrap_or(20);
    let offset = params.get("offset").and_then(|o| o.parse::<i32>().ok()).unwrap_or(0);
    
    // If biz_id looks like a MID (starts with 00 and length > 10), resolve it to numeric ID
    if biz_id.starts_with("00") && biz_id.len() >= 10 {
        let resolve_payload = json!({
            "req_1": {
                "module": "music.pf_song_detail_svr",
                "method": "get_song_detail",
                "param": { "song_mid": biz_id.clone() }
            },
            "comm": { "uin": 0, "format": "json", "ct": 24, "cv": 0 }
        });
        
        if let Ok(resp) = musicu_request(client, resolve_payload, &options.cookie, options.trace_id.clone()).await {
            if let Some(resolved_id) = resp.body["req_1"]["data"]["track_info"]["id"].as_u64() {
                biz_id = resolved_id.to_string();
                println!("[QQ Comment] Resolved MID {} to Numeric ID {}", params.get("id").unwrap(), biz_id);
            }
        }
    }

    // Legacy API uses 0-based page_num
    let page_num = offset / limit;

    // cmd 8 is for latest, 9 is for hot/best comments
    // In mod.rs, we pass sort=3 for song_hot_comments
    let cmd = if sort == 3 { 9 } else { 8 }; 

    let url = format!(
        "https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg?g_tk=5381&loginUin=0&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0&cid=205360772&reqtype=2&biztype=1&topid={}&cmd={}&pagenum={}&pagesize={}",
        biz_id, cmd, page_num, limit
    );

    let mut headers = Vec::new();
    headers.push(("Referer".to_string(), "https://y.qq.com/".to_string()));
    headers.push(("User-Agent".to_string(), crate::config::DEFAULT_USER_AGENT.to_string()));

    if !options.cookie.is_empty() {
        headers.push(("Cookie".to_string(), options.cookie.clone()));
    }

    client.request("GET", &url, headers, "".to_string(), options.trace_id.clone()).await
}
