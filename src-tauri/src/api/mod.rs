use crate::http::{HttpClient, HttpResponse, HttpResult};
use crate::Options;
use crate::error::AppError;
use self::base::ApiProvider;

pub mod base;
pub mod models;
pub mod netease;
pub mod qq;
pub mod qishui;
pub mod local;

pub async fn dispatch(
    client: &HttpClient,
    provider: &str,
    api_name: &str,
    options: Options,
) -> HttpResult<HttpResponse> {
    match provider {
        "netease" => netease::NeteaseProvider.dispatch(client, api_name, options).await,
        "qq" => qq::QQProvider.dispatch(client, api_name, options).await,
        "qishui" => qishui::QishuiProvider.dispatch(client, api_name, options).await,
        "local" => local::LocalProvider.dispatch(client, api_name, options).await,
        _ => Err(AppError::Api(format!("Unknown provider: {}", provider))),
    }
}

pub async fn dispatch_gateway(
    client: &HttpClient,
    provider: &str,
    api_name: &str,
    options: Options,
) -> HttpResult<models::GatewayResponse> {
    match provider {
        "netease" => netease::NeteaseProvider.dispatch_gateway(client, api_name, options).await,
        "qq" => qq::QQProvider.dispatch_gateway(client, api_name, options).await,
        "qishui" => qishui::QishuiProvider.dispatch_gateway(client, api_name, options).await,
        "local" => local::LocalProvider.dispatch_gateway(client, api_name, options).await,
        _ => Err(AppError::Api(format!("Unknown provider: {}", provider))),
    }
}
