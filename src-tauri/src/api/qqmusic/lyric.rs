use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::Options;
use crate::api::netease::parse_params;

pub async fn get(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let mid = params.get("songmid").cloned().unwrap_or_default();
    let url = format!("https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid={}&format=json&nobase64=0", mid);
    
    let mut headers = Vec::new();
    headers.push(("Referer".to_string(), "https://y.qq.com/".to_string()));
    
    client.request("GET", &url, headers, "".to_string()).await
}
