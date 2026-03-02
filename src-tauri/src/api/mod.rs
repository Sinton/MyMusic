use crate::http::{HttpClient, HttpResponse, HttpResult};
use crate::Options;
use crate::error::AppError;

pub mod netease;
pub mod qqmusic;

pub async fn dispatch(
    client: &HttpClient,
    provider: &str,
    api_name: &str,
    options: Options,
) -> HttpResult<HttpResponse> {
    match provider {
        "netease" => netease::dispatch(client, api_name, options).await,
        "qqmusic" => qqmusic::dispatch(client, api_name, options).await,
        _ => Err(AppError::Api(format!("Unknown provider: {}", provider))),
    }
}
