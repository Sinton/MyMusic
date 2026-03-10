use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::Options;
use crate::error::AppError;
use crate::api::models::GatewayResponse;
use serde::{Serialize, Deserialize};
use serde_json::{json, Value};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use lofty::prelude::*;
use lofty::probe::Probe;
use base64::{Engine as _, engine::general_purpose};

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalTrack {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration: u64,
    pub path: String,
    pub cover: Option<String>, // Base64 image
    pub size: u64,
    pub platform: String,
}

pub struct LocalProvider;

#[async_trait::async_trait]
impl crate::api::base::ApiProvider for LocalProvider {
    fn id(&self) -> &'static str {
        "local"
    }

    async fn dispatch(
        &self,
        _client: &HttpClient,
        api_name: &str,
        options: Options,
    ) -> HttpResult<HttpResponse> {
        match api_name {
            "scan" => self.scan(options).await,
            _ => Err(AppError::Api(format!("Unknown Local API: {}", api_name))),
        }
    }

    async fn dispatch_gateway(
        &self,
        client: &HttpClient,
        api_name: &str,
        options: Options,
    ) -> HttpResult<GatewayResponse> {
        match api_name {
            "scan" => {
                let resp = self.dispatch(client, api_name, options).await?;
                Ok(GatewayResponse::Raw(resp.body))
            }
            _ => {
                let resp = self.dispatch(client, api_name, options).await?;
                Ok(GatewayResponse::Raw(resp.body))
            }
        }
    }
}

impl LocalProvider {
    async fn scan(&self, options: Options) -> HttpResult<HttpResponse> {
        let mut params_map = std::collections::HashMap::new();
        for pair in options.params.split('&') {
            if let Some((k, v)) = pair.split_once('=') {
                params_map.insert(k.to_string(), v.to_string());
            }
        }

        let directory_raw = params_map.get("directory").ok_or(AppError::MissingParam("directory".to_string()))?;
        
        // Use more robust decoding for Windows paths
        let directory_str = url::form_urlencoded::parse(directory_raw.as_bytes())
            .map(|(k, _)| k.into_owned())
            .next()
            .unwrap_or_else(|| directory_raw.clone());

        let directory = PathBuf::from(&directory_str);
        
        println!("[Local Scan] Directory: {:?}", directory);

        let mut tracks = Vec::new();

        if directory.exists() {
            for entry in WalkDir::new(&directory).into_iter().filter_map(|e| e.ok()) {
                let path = entry.path();
                if path.is_file() {
                    if let Some(ext) = path.extension() {
                        let ext = ext.to_string_lossy().to_lowercase();
                        if matches!(ext.as_str(), "mp3" | "flac" | "wav" | "m4a" | "ogg") {
                            if let Ok(track) = self.extract_metadata(path) {
                                tracks.push(track);
                            }
                        }
                    }
                }
            }
        } else {
            println!("[Local Scan] Directory does NOT exist: {:?}", directory);
        }

        println!("[Local Scan] Found {} tracks", tracks.len());

        Ok(HttpResponse {
            status: 200,
            body: json!({
                "code": 0,
                "tracks": tracks,
                "count": tracks.len(),
                "platform": "local"
            }),
            headers: std::collections::HashMap::new(),
            raw_body: Vec::new(),
        })
    }

    fn extract_metadata(&self, path: &Path) -> Result<LocalTrack, Box<dyn std::error::Error>> {
        let tagged_file = Probe::open(path)?.read()?;
        let properties = tagged_file.properties();
        
        // Try to get primary tag
        let tag = tagged_file.primary_tag()
            .or_else(|| tagged_file.first_tag());

        let title = tag.and_then(|t: &lofty::tag::Tag| t.title().map(|s| s.into_owned()))
            .unwrap_or_else(|| path.file_stem().unwrap_or_default().to_string_lossy().into_owned());
        
        let artist = tag.and_then(|t: &lofty::tag::Tag| t.artist().map(|s| s.into_owned()))
            .unwrap_or_else(|| "Unknown Artist".to_string());
            
        let album = tag.and_then(|t: &lofty::tag::Tag| t.album().map(|s| s.into_owned()))
            .unwrap_or_else(|| "Unknown Album".to_string());

        let duration = properties.duration().as_secs();
        let size = std::fs::metadata(path)?.len();

        // Extract cover if exists
        let cover = tag.and_then(|t: &lofty::tag::Tag| {
            t.pictures().first().map(|pic| {
                let data = pic.data();
                let mime = pic.mime_type().map(|m| m.as_str()).unwrap_or("image/jpeg");
                format!("data:{};base64,{}", mime, general_purpose::STANDARD.encode(data))
            })
        });

        let digest = md5::compute(path.to_string_lossy().as_bytes());
        Ok(LocalTrack {
            id: format!("local_{:x}", digest),
            title,
            artist,
            album,
            duration,
            path: path.to_string_lossy().into_owned(),
            cover,
            size,
            platform: "local".to_string(),
        })
    }
}
