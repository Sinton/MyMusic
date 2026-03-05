use crate::http::{HttpClient, HttpResponse, HttpResult};
use crate::Options;
use crate::error::AppError;
use self::base::ApiProvider;

pub mod base;
pub mod netease;
pub mod qqmusic;
pub mod qishui;

pub async fn dispatch(
    client: &HttpClient,
    provider: &str,
    api_name: &str,
    options: Options,
) -> HttpResult<HttpResponse> {
    match provider {
        "netease" => netease::NeteaseProvider.dispatch(client, api_name, options).await,
        "qqmusic" => qqmusic::QQMusicProvider.dispatch(client, api_name, options).await,
        "qishui" => qishui::QishuiProvider.dispatch(client, api_name, options).await,
        _ => Err(AppError::Api(format!("Unknown provider: {}", provider))),
    }
}
