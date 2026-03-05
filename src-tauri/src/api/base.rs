use async_trait::async_trait;
use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::Options;

#[async_trait]
pub trait ApiProvider: Send + Sync {
    /// Returns the unique identifier for this provider (e.g., "netease", "qqmusic")
    fn id(&self) -> &'static str;

    /// Dispatches an API call to the provider
    async fn dispatch(
        &self,
        client: &HttpClient,
        api_name: &str,
        options: Options,
    ) -> HttpResult<HttpResponse>;
}
