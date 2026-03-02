use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::Options;
use serde_json::json;
use crate::api::netease::parse_params;
use super::musicu_request;

pub async fn url(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let mid = params.get("id").or(params.get("mid")).cloned().unwrap_or_default();
    
    let qualities = vec![
        ("M800", "mp3"),
        ("C400", "m4a"),
    ];
    
    let mut filenames = Vec::new();
    for q in &qualities {
        filenames.push(format!("{}{}{}.{}", q.0, mid, mid, q.1));
    }
    let songmids: Vec<String> = vec![mid.clone(); qualities.len()];
    let songtypes: Vec<i32> = vec![0; qualities.len()];

    let payload = json!({
        "req_1": {
            "module": "vkey.GetVkeyServer",
            "method": "CgiGetVkey",
            "param": {
                "filename": filenames,
                "guid": "1000000000",
                "songmid": songmids,
                "songtype": songtypes,
                "uin": "0",
                "loginflag": 1,
                "platform": "20"
            }
        },
        "loginUin": "0",
        "comm": { "uin": "0", "format": "json", "ct": 24, "cv": 0 }
    });

    musicu_request(client, payload, &options.cookie).await
}
