use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use super::base::ApiProvider;
use serde_json::{json, Value};
use super::models::GatewayResponse;
use crate::Options;

pub mod artist;
pub mod album;
pub mod search;
pub mod song;
pub mod playlist;
pub mod lyric;
pub mod mapper;
pub mod comment;

pub(crate) async fn musicu_request(
    client: &HttpClient,
    payload: Value,
    cookie: &str,
    trace_id: Option<String>,
) -> HttpResult<HttpResponse> {
    let url = crate::config::qq::MUSICU_URL;
    let body = payload.to_string();

    let mut headers = Vec::new();
    headers.push(("User-Agent".to_string(), crate::config::DEFAULT_USER_AGENT.to_string()));
    headers.push(("Referer".to_string(), crate::config::qq::REFERER.to_string()));
    headers.push(("Content-Type".to_string(), "application/json".to_string()));

    if !cookie.is_empty() {
        headers.push(("Cookie".to_string(), cookie.to_string()));
    }

    client.request("POST", url, headers, body, trace_id).await
}

pub struct QQProvider;

#[async_trait::async_trait]
impl super::base::ApiProvider for QQProvider {
    fn id(&self) -> &'static str {
        "qq"
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
            "song_comments" => comment::get(client, options, 1).await,      // Sort 1: Latest
            "song_hot_comments" => comment::get(client, options, 3).await,  // Sort 3: Hot
            _ => Err(AppError::Api(format!("Unknown QQ API: {}", api_name))),
        }
    }

    async fn dispatch_gateway(
        &self,
        client: &HttpClient,
        api_name: &str,
        options: Options,
    ) -> HttpResult<GatewayResponse> {
        match api_name {
            "search" => {
                let resp = self.dispatch(client, api_name, options).await?;
                let unified = mapper::map_search_response(&resp.body);
                Ok(GatewayResponse::SearchBatch(unified))
            }
            "artist_detail" => {
                let resp = self.dispatch(client, api_name, options).await?;
                let unified = mapper::map_artist_detail(&resp.body);
                Ok(GatewayResponse::ArtistDetail(unified))
            }
            "album_detail" => {
                 let resp = self.dispatch(client, api_name, options).await?;
                 let unified = mapper::map_album_detail(&resp.body);
                 Ok(GatewayResponse::AlbumDetail(unified))
            }
            "song_comments" | "song_hot_comments" => {
                let resp = self.dispatch(client, api_name, options).await?;
                let unified = mapper::map_comments(&resp.body);
                Ok(GatewayResponse::Comments(unified))
            }
            _ => {
                let resp = self.dispatch(client, api_name, options).await?;
                Ok(GatewayResponse::Raw(resp.body))
            }
        }
    }
}

pub async fn dispatch(
    client: &HttpClient,
    api_name: &str,
    options: Options,
) -> HttpResult<HttpResponse> {
    QQProvider.dispatch(client, api_name, options).await
}