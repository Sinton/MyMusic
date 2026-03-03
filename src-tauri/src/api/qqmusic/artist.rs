use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::Options;
use serde_json::json;
use crate::api::netease::parse_params;
use super::musicu_request;

pub async fn detail(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let mid = params.get("id").or(params.get("mid")).cloned().unwrap_or_default();
    println!("[QQMusic] artist_detail mid: {}", mid);

    let payload = json!({
        "comm": { "ct": "19", "cv": "1859", "uin": "0" },
        "req": {
            "module": "music.web_singer_info_svr",
            "method": "get_singer_detail_info",
            "param": { "sort": 5, "singermid": mid.clone(), "sin": 0, "num": 10 }
        }
    });

    musicu_request(client, payload, &options.cookie, options.trace_id.clone()).await
}

pub async fn songs(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let mid = params.get("id").or(params.get("mid")).cloned().unwrap_or_default();
    println!("[QQMusic] artist_songs mid: {}", mid);
    let begin = params.get("page").and_then(|p| p.parse::<i32>().ok()).unwrap_or(0) * 50;
    
    let payload = json!({
        "comm": { "ct": "19", "cv": "1859", "uin": "0" },
        "req": {
            "module": "musichall.song_list_server",
            "method": "GetSingerSongList",
            "param": { "singerMid": mid, "begin": begin, "num": 50, "order": 1 }
        }
    });

    musicu_request(client, payload, &options.cookie, options.trace_id.clone()).await
}

pub async fn albums(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let mid = params.get("id").or(params.get("mid")).cloned().unwrap_or_default();
    println!("[QQMusic] artist_albums mid: {}", mid);
    let begin = params.get("begin").and_then(|p| p.parse::<i32>().ok()).unwrap_or(0);
    
    let payload = json!({
        "comm": { "ct": "19", "cv": "1859", "uin": "0" },
        "req": {
            "module": "music.musichallAlbum.AlbumListServer",
            "method": "GetAlbumList",
            "param": { "singerMid": mid, "begin": begin, "num": 30, "order": 0 }
        }
    });

    musicu_request(client, payload, &options.cookie, options.trace_id.clone()).await
}
