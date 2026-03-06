use async_trait::async_trait;
use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::Options;
use super::models::GatewayResponse;

#[async_trait]
pub trait ApiProvider: Send + Sync {
    /// Returns the unique identifier for this provider (e.g., "netease", "qq")
    fn id(&self) -> &'static str;

    /// Dispatches an API call to the provider returning raw response
    async fn dispatch(
        &self,
        client: &HttpClient,
        api_name: &str,
        options: Options,
    ) -> HttpResult<HttpResponse>;

    /// Dispatches an API call and returns a gateway response format
    async fn dispatch_gateway(
        &self,
        client: &HttpClient,
        api_name: &str,
        options: Options,
    ) -> HttpResult<GatewayResponse> {
        // Default implementation returns raw body as JSON if not specifically overridden
        let resp = self.dispatch(client, api_name, options).await?;
        Ok(GatewayResponse::Raw(resp.body))
    }
}
