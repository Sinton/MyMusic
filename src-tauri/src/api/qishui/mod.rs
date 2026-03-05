use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use super::base::ApiProvider;
use crate::Options;

pub mod track;
pub mod lyric;
pub mod resolve;
pub mod artist;
pub mod album;

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
}

pub async fn dispatch(
    client: &HttpClient,
    api_name: &str,
    options: Options,
) -> HttpResult<HttpResponse> {
    QishuiProvider.dispatch(client, api_name, options).await
}
