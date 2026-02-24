use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct BaseResponse {
    pub code: i32,
    pub message: Option<String>,
    pub msg: Option<String>,
}

// ========== Login DTOs ==========

#[derive(Debug, Serialize, Deserialize)]
pub struct QrKeyData {
    pub unikey: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QrKeyResponse {
    pub data: QrKeyData,
    pub code: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QrCheckResponse {
    pub code: i32,
    pub message: String,
    pub cookie: Option<String>,
    pub nickname: Option<String>,
    pub avatar_url: Option<String>,
}

// ========== Song DTOs ==========

#[derive(Debug, Serialize, Deserialize)]
pub struct SongUrlItem {
    pub id: i64,
    pub url: Option<String>,
    pub br: i32,
    pub size: i64,
    pub r#type: String,
    pub level: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SongUrlResponse {
    pub data: Vec<SongUrlItem>,
    pub code: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Artist {
    pub id: i64,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Album {
    pub id: i64,
    pub name: String,
    pub pic_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SongDetail {
    pub id: i64,
    pub name: String,
    pub ar: Vec<Artist>,
    pub al: Album,
    pub dt: i64, // duration
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SongDetailResponse {
    pub songs: Vec<SongDetail>,
    pub code: i32,
}

// ========== Playlist DTOs ==========

#[derive(Debug, Serialize, Deserialize)]
pub struct Playlist {
    pub id: i64,
    pub name: String,
    pub cover_img_url: Option<String>,
    pub track_count: i32,
    pub play_count: i64,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserPlaylistResponse {
    pub playlist: Vec<Playlist>,
    pub code: i32,
}
