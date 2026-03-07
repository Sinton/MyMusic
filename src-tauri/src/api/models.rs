use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MusicTrack {
    pub song_id: String,
    pub platform: String,
    pub title: String,
    pub artists: Vec<MusicArtist>,
    pub album: Option<MusicAlbum>,
    pub duration: u32,       // in seconds
    pub cover_url: Option<String>,
    pub raw_url: Option<String>,
    pub vip: bool,
    pub song_mid: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MusicArtist {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MusicAlbum {
    pub id: String,
    pub name: String,
    pub cover_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MusicPlaylist {
    pub id: String,
    pub platform: String,
    pub name: String,
    pub description: Option<String>,
    pub cover_url: Option<String>,
    pub track_count: Option<u32>,
    pub creator: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MusicSearchBatch {
    pub platform: String,
    pub tracks: Vec<MusicTrack>,
    pub total: u32,
    pub has_more: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MusicArtistDetail {
    pub id: String,
    pub platform: String,
    pub name: String,
    pub avatar_url: Option<String>,
    pub description: Option<String>,
    pub track_count: Option<u32>,
    pub album_count: Option<u32>,
    pub popular_songs: Vec<MusicTrack>,
    pub albums: Vec<MusicAlbum>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MusicAlbumDetail {
    pub id: String,
    pub platform: String,
    pub name: String,
    pub artist_name: String,
    pub cover_url: Option<String>,
    pub description: Option<String>,
    pub release_date: Option<String>,
    pub track_count: Option<u32>,
    pub tracks: Vec<MusicTrack>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MusicComment {
    pub id: String,
    pub content: String,
    pub time: u64,
    pub liked_count: u32,
    pub user: MusicCommentUser,
    pub replying_to: Option<String>,
    pub liked: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MusicCommentUser {
    pub id: String,
    pub nickname: String,
    pub avatar_url: Option<String>,
    pub vip_icon_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MusicComments {
    pub platform: String,
    pub total: u32,
    pub has_more: bool,
    pub comments: Vec<MusicComment>,
    pub hot_comments: Option<Vec<MusicComment>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "data")]
pub enum GatewayResponse {
    Track(MusicTrack),
    Tracks(Vec<MusicTrack>),
    Artist(MusicArtist),
    ArtistDetail(MusicArtistDetail),
    Album(MusicAlbum),
    AlbumDetail(MusicAlbumDetail),
    Playlist(MusicPlaylist),
    Playlists(Vec<MusicPlaylist>),
    SearchBatch(MusicSearchBatch),
    Comments(MusicComments),
    Raw(Value),
}
