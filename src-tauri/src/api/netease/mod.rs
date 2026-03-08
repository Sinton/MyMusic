use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use super::base::ApiProvider;
use serde_json::{json, Value};
use self::crypto::Crypto;
use crate::Options;
use std::collections::HashMap;
use super::models::GatewayResponse;

pub mod login;
pub mod song;
pub mod playlist;
pub mod discover;
pub mod search;
pub mod user;
pub mod artist;
pub mod comment;
pub mod dto;
pub mod crypto;
pub mod mapper;

/// Parse a query-string-style params string into a HashMap
pub(crate) fn parse_params(params: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();
    if params.is_empty() {
        return map;
    }
    for pair in params.split('&') {
        if let Some((k, v)) = pair.split_once('=') {
            map.insert(k.to_string(), v.to_string());
        }
    }
    map
}

pub(crate) fn get_cookie_string(cookie: &str) -> String {
    let mut base_cookie = cookie.to_owned();
    if !base_cookie.contains("os=") {
        if base_cookie.is_empty() {
            base_cookie = "os=pc;".to_string();
        } else {
            base_cookie = format!("os=pc; {}", base_cookie);
        }
    }
    base_cookie
}

pub(crate) struct RequestData {
    pub url: String,
    pub method: String,
    pub headers: Vec<(String, String)>,
    pub body: String,
}

pub(crate) fn prepare_request(
    url: &str,
    method: &str,
    crypto: &str,
    query_params: Value,
    cookies: &str,
    request_params: Value,
) -> RequestData {
    let mut headers: Vec<(String, String)> = Vec::new();

    let ua = if crypto == "linuxapi" {
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    } else {
        crate::config::DEFAULT_USER_AGENT
    };
    headers.push(("user-agent".to_string(), ua.to_string()));

    if method.to_uppercase() == "POST" {
        headers.push(("content-type".to_string(), "application/x-www-form-urlencoded".to_string()));
    }

    if url.contains("music.163.com") {
        headers.push(("referer".to_string(), crate::config::netease::REFERER.to_string()));
        headers.push(("origin".to_string(), "https://music.163.com".to_string()));
    }

    if !cookies.is_empty() {
        headers.push(("cookie".to_string(), cookies.to_string()));
    }

    let (final_url, body) = match crypto {
        "weapi" => (url.to_string(), Crypto::weapi(&query_params.to_string())),
        "eapi" => {
            let eapi_url = request_params["url"].as_str().unwrap_or("");
            (url.to_string(), Crypto::eapi(eapi_url, &query_params.to_string()))
        }
        "linuxapi" => {
             let data = json!({
                "method": method,
                "url": url.replace("weapi", "api"),
                "params": query_params
            });
            ("https://music.163.com/api/linux/forward".to_string(), Crypto::linuxapi(&data.to_string()))
        }
         _ => (url.to_string(), "".to_string()),
    };

    RequestData {
        url: final_url,
        method: method.to_string(),
        headers,
        body,
    }
}

pub(crate) async fn request_handler(
    client: &HttpClient,
    url: &str,
    crypto: &str,
    query_params: Value,
    cookies: &str,
    extra_params: Value,
    trace_id: Option<String>,
    use_cookie_store: bool,
) -> HttpResult<HttpResponse> {
     let req_data = prepare_request(url, "POST", crypto, query_params, cookies, extra_params);
     client.request_full(&req_data.method, &req_data.url, req_data.headers, req_data.body, trace_id, use_cookie_store).await
}

pub(crate) async fn weapi(client: &HttpClient, url: &str, params: Value, options: &Options) -> HttpResult<HttpResponse> {
    let cookies = get_cookie_string(&options.cookie);
    
    // Aligns with official behavior: add csrf_token to URL if __csrf exists in cookies
    let mut final_url = url.to_string();
    if let Some(csrf) = cookies.split(';').find(|s| s.trim().starts_with("__csrf=")) {
        if let Some((_, val)) = csrf.split_once('=') {
            let csrf_val = val.trim();
            if !csrf_val.is_empty() {
                let sep = if final_url.contains('?') { "&" } else { "?" };
                final_url = format!("{}{}csrf_token={}", final_url, sep, csrf_val);
            }
        }
    }

    request_handler(client, &final_url, "weapi", params, &cookies, json!({}), options.trace_id.clone(), true).await
}

pub(crate) async fn weapi_without_cookie(client: &HttpClient, url: &str, params: Value, options: &Options) -> HttpResult<HttpResponse> {
    // Explicitly use_cookie_store = false to prevent reqwest from adding internal cookies
    request_handler(client, url, "weapi", params, "", json!({}), options.trace_id.clone(), false).await
}

pub(crate) async fn eapi(client: &HttpClient, url: &str, params: Value, eapi_path: &str, options: &Options) -> HttpResult<HttpResponse> {
    let cookies = get_cookie_string(&options.cookie);
    request_handler(client, url, "eapi", params, &cookies, json!({ "url": eapi_path }), options.trace_id.clone(), true).await
}

pub(crate) async fn linuxapi(client: &HttpClient, url: &str, params: Value, options: &Options) -> HttpResult<HttpResponse> {
    let cookies = get_cookie_string(&options.cookie);
    request_handler(client, url, "linuxapi", params, &cookies, json!({}), options.trace_id.clone(), true).await
}

pub struct NeteaseProvider;

#[async_trait::async_trait]
impl super::base::ApiProvider for NeteaseProvider {
    fn id(&self) -> &'static str {
        "netease"
    }

    async fn dispatch(
        &self,
        client: &HttpClient,
        api_name: &str,
        options: Options,
    ) -> HttpResult<HttpResponse> {
        match api_name {
            // Login
            "login_qr_key" => login::qr_key(client, options).await,
            "login_qr_create" => login::qr_create(client, options).await,
            "login_qr_check" => login::qr_check(client, options).await,
            "login_status" => login::status(client, options).await,
            "login_refresh" => login::refresh(client, options).await,
            "logout" => login::logout(client, options).await,
            "auth_qr_init" => login::qr_init_combined(client, options).await,
            "auth_qr_check" => login::qr_check(client, options).await,
            
            // Song
            "song_url" => song::url(client, options).await,
            "song_url_v1" => song::url_v1(client, options).await,
            "song_detail" => song::detail(client, options).await,
            "lyric" => song::lyric(client, options).await,
            
            // Playlist
            "user_playlist" => playlist::user(client, options).await,
            "playlist_detail" => playlist::detail(client, options).await,
            
            // Search
            "search" => search::get(client, options).await,
            
            // Discover
            "personalized" => discover::personalized(client, options).await,
            "album_newest" => discover::album_newest(client, options).await,
            "album_detail" => discover::album_detail(client, options).await,
            "toplist" => discover::toplist(client, options).await,
            "recommend_resource" => discover::recommend_resource(client, options).await,
            "recommend_songs" => discover::recommend_songs(client, options).await,
            
            // Artist
            "artist_detail" => artist::detail(client, options).await,
            "artist_songs" => artist::songs(client, options).await,
            "artist_album" => artist::albums(client, options).await,
            
            // Comment
            "song_comments" => comment::song_comments(client, options).await,
            "song_hot_comments" => comment::song_hot_comments(client, options).await,
            
            // User
            "user_account" => user::account(client, options).await,
            
            _ => Err(AppError::Api(format!("Unknown Netease API: {}", api_name))),
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
            "playlist_detail" => {
                let resp = self.dispatch(client, api_name, options).await?;
                let unified = mapper::map_playlist_detail(&resp.body);
                Ok(GatewayResponse::Playlist(unified))
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
            "auth_qr_init" | "auth_qr_check" => {
                let resp = self.dispatch(client, api_name, options).await?;
                let unified = mapper::map_auth_response(&resp, api_name);
                Ok(GatewayResponse::Auth(unified))
            }
            _ => {
                let resp = self.dispatch(client, api_name, options).await?;
                Ok(GatewayResponse::Raw(resp.body))
            }
        }
    }
}

pub async fn dispatch(client: &HttpClient, api_name: &str, options: Options) -> HttpResult<HttpResponse> {
    NeteaseProvider.dispatch(client, api_name, options).await
}

pub async fn dispatch_gateway(client: &HttpClient, api_name: &str, options: Options) -> HttpResult<GatewayResponse> {
    NeteaseProvider.dispatch_gateway(client, api_name, options).await
}
