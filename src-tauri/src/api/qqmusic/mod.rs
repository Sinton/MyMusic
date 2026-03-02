use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use serde_json::{json, Value};
use crate::Options;

pub mod artist;
pub mod album;
pub mod search;
pub mod song;
pub mod playlist;
pub mod lyric;

pub(crate) async fn musicu_request(
    client: &HttpClient,
    payload: Value,
    cookie: &str,
) -> HttpResult<HttpResponse> {
    let url = "https://u.y.qq.com/cgi-bin/musicu.fcg";
    let body = payload.to_string();

    let mut headers = Vec::new();
    headers.push(("User-Agent".to_string(), "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36".to_string()));
    headers.push(("Referer".to_string(), "https://y.qq.com/".to_string()));
    headers.push(("Content-Type".to_string(), "application/json".to_string()));

    if !cookie.is_empty() {
        headers.push(("Cookie".to_string(), cookie.to_string()));
    }

    client.request("POST", url, headers, body).await
}

pub async fn dispatch(
    client: &HttpClient,
    api_name: &str,
    options: Options,
) -> HttpResult<HttpResponse> {
    match api_name {
        "search" => search::get(client, options).await,
        "song_url" => song::url(client, options).await,
        "lyric" => lyric::get(client, options).await,
        "user_playlists" => playlist::user(client, options).await,
        "artist_detail" => artist::detail(client, options).await,
        "artist_songs" => artist::songs(client, options).await,
        "artist_albums" => artist::albums(client, options).await,
        "album_detail" => album::detail(client, options).await,
        _ => Err(AppError::Api(format!("Unknown QQMusic API: {}", api_name))),
    }
}
