use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use super::base::ApiProvider;
use crate::Options;
use super::models::UnifiedResponse;

pub mod track;
pub mod lyric;
pub mod resolve;
pub mod artist;
pub mod album;
pub mod mapper;

pub struct QishuiProvider;

#[async_trait::async_trait]
impl super::base::ApiProvider for QishuiProvider {
    fn id(&self) -> &'static str {
        "qishui"
    }

    async fn dispatch(
        &self,
        client: &HttpClient,
        api_name: &str,
        options: Options,
    ) -> HttpResult<HttpResponse> {
        match api_name {
            "track_detail" => track::detail(client, options).await,
            "lyric" => lyric::get(client, options).await,
            "resolve_link" => resolve::resolve(client, options).await,
            "validate_link" => resolve::validate(client, options).await,
            "artist_detail" => artist::detail(client, options).await,
            "album_detail" => album::detail(client, options).await,
            _ => Err(AppError::Api(format!("Unknown Qishui API: {}", api_name))),
        }
    }

    async fn dispatch_unified(
        &self,
        client: &HttpClient,
        api_name: &str,
        options: Options,
    ) -> HttpResult<UnifiedResponse> {
        match api_name {
            "resolve_link" => {
                let resp = self.dispatch(client, "resolve_link", options).await?;
                let unified = mapper::map_track_detail(&resp.body);
                Ok(UnifiedResponse::Track(unified))
            }
            "track_detail" => {
                let resp = self.dispatch(client, "track_detail", options).await?;
                let unified = mapper::map_track_detail(&resp.body);
                Ok(UnifiedResponse::Track(unified))
            }
            "artist_detail" => {
                let resp = self.dispatch(client, "artist_detail", options).await?;
                let unified = mapper::map_artist_detail(&resp.body);
                Ok(UnifiedResponse::ArtistDetail(unified))
            }
            "album_detail" => {
                let resp = self.dispatch(client, "album_detail", options).await?;
                let unified = mapper::map_album_detail(&resp.body);
                Ok(UnifiedResponse::AlbumDetail(unified))
            }
            _ => {
                let resp = self.dispatch(client, api_name, options).await?;
                Ok(UnifiedResponse::Raw(resp.body))
            }
        }
    }
}

pub async fn dispatch(
    client: &HttpClient,
    api_name: &str,
    options: Options,
) -> HttpResult<HttpResponse> {
    QishuiProvider.dispatch(client, api_name, options).await
}

pub async fn dispatch_unified(
    client: &HttpClient,
    api_name: &str,
    options: Options,
) -> HttpResult<UnifiedResponse> {
    QishuiProvider.dispatch_unified(client, api_name, options).await
}
