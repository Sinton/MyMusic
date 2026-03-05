use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnifiedTrack {
    pub id: String,
    pub platform: String, // "netease" | "qq" | "qishui"
    pub title: String,
    pub artists: Vec<UnifiedArtist>,
    pub album: Option<UnifiedAlbum>,
    pub duration: u32,       // in seconds
    pub cover_url: Option<String>,
    pub raw_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnifiedArtist {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnifiedAlbum {
    pub id: String,
    pub name: String,
    pub cover_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnifiedPlaylist {
    pub id: String,
    pub platform: String,
    pub name: String,
    pub description: Option<String>,
    pub cover_url: Option<String>,
    pub track_count: Option<u32>,
    pub creator: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnifiedSearchBatch {
    pub platform: String,
    pub tracks: Vec<UnifiedTrack>,
    pub total: u32,
    pub has_more: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnifiedArtistDetail {
    pub id: String,
    pub platform: String,
    pub name: String,
    pub avatar_url: Option<String>,
    pub description: Option<String>,
    pub track_count: Option<u32>,
    pub album_count: Option<u32>,
    pub popular_songs: Vec<UnifiedTrack>,
    pub albums: Vec<UnifiedAlbum>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnifiedAlbumDetail {
    pub id: String,
    pub platform: String,
    pub name: String,
    pub artist_name: String,
    pub cover_url: Option<String>,
    pub description: Option<String>,
    pub release_date: Option<String>,
    pub track_count: Option<u32>,
    pub tracks: Vec<UnifiedTrack>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "data")]
pub enum UnifiedResponse {
    Track(UnifiedTrack),
    Tracks(Vec<UnifiedTrack>),
    Artist(UnifiedArtist),
    ArtistDetail(UnifiedArtistDetail),
    Album(UnifiedAlbum),
    AlbumDetail(UnifiedAlbumDetail),
    Playlist(UnifiedPlaylist),
    SearchBatch(UnifiedSearchBatch),
    Raw(Value), // Fallback for non-unified or legacy data
}
