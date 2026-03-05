use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use super::base::ApiProvider;
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
    trace_id: Option<String>,
) -> HttpResult<HttpResponse> {
    let url = crate::config::qqmusic::MUSICU_URL;
    let body = payload.to_string();

    let mut headers = Vec::new();
    headers.push(("User-Agent".to_string(), crate::config::DEFAULT_USER_AGENT.to_string()));
    headers.push(("Referer".to_string(), crate::config::qqmusic::REFERER.to_string()));
    headers.push(("Content-Type".to_string(), "application/json".to_string()));

    if !cookie.is_empty() {
        headers.push(("Cookie".to_string(), cookie.to_string()));
    }

    client.request("POST", url, headers, body, trace_id).await
}

pub struct QQMusicProvider;

#[async_trait::async_trait]
impl super::base::ApiProvider for QQMusicProvider {
    fn id(&self) -> &'static str {
        "qqmusic"
    }

    async fn dispatch(
        &self,
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
}

pub async fn dispatch(
    client: &HttpClient,
    api_name: &str,
    options: Options,
) -> HttpResult<HttpResponse> {
    QQMusicProvider.dispatch(client, api_name, options).await
}
