use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::Options;
use serde_json::json;
use crate::api::netease::parse_params;
use super::musicu_request;

pub async fn detail(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let mid = params.get("id").or(params.get("mid")).cloned().unwrap_or_default();
    println!("[QQMusic] album_detail mid: {}", mid);
    
    let payload = json!({
        "comm": { "ct": "19", "cv": "1859", "uin": "0" },
        "req": {
            "module": "music.musichallAlbum.AlbumInfoServer",
            "method": "GetAlbumDetail",
            "param": { "albumMid": mid.clone() }
        },
        "req_1": {
            "module": "music.musichallAlbum.AlbumSongList",
            "method": "GetAlbumSongList",
            "param": { "albumMid": mid.clone(), "begin": 0, "num": 100, "order": 2 }
        }
    });

    musicu_request(client, payload, &options.cookie, options.trace_id.clone()).await
}
