use crate::api::models::{UnifiedTrack, UnifiedArtist, UnifiedAlbum, UnifiedSearchBatch, UnifiedPlaylist, UnifiedArtistDetail, UnifiedAlbumDetail};
use serde_json::Value;

pub fn map_song_to_unified(s: &Value, platform: &str) -> UnifiedTrack {
    let artists = s["ar"].as_array().or(s["singer"].as_array()).cloned().unwrap_or_default().into_iter().map(|ar| {
        UnifiedArtist {
            id: ar["id"].to_string(),
            name: ar["name"].as_str().unwrap_or("Unknown Artist").to_string(),
        }
    }).collect();

    let album_data = if s["al"].is_object() { &s["al"] } else { &s["album"] };
    let album = if album_data.is_object() {
        let album_mid = album_data["mid"].as_str().unwrap_or("");
        let cover_url = if !album_mid.is_empty() {
             Some(format!("https://y.gtimg.cn/music/photo_new/T002R300x300M000{}.jpg", album_mid))
        } else {
             album_data["picUrl"].as_str().map(|u| u.to_string())
        };

        Some(UnifiedAlbum {
            id: album_data["id"].to_string(),
            name: album_data["name"].as_str().unwrap_or("Unknown Album").to_string(),
            cover_url,
        })
    } else {
        None
    };

    let duration = s["dt"].as_u64().or(s["interval"].as_u64()).unwrap_or(0);
    // Netease dt is ms, QQ interval is seconds.
    let duration_sec = if platform == "netease" { (duration / 1000) as u32 } else { duration as u32 };

    UnifiedTrack {
        id: s["id"].to_string(),
        platform: platform.to_string(),
        title: s["name"].as_str().unwrap_or("Unknown Track").to_string(),
        artists,
        album,
        duration: duration_sec,
        cover_url: if platform == "netease" { s["al"]["picUrl"].as_str().map(|u| u.to_string()) } else { None }, // QQ cover is handled in album
        raw_url: None,
    }
}

pub fn map_search_response(body: &Value) -> UnifiedSearchBatch {
    let result = &body["result"];
    let songs = result["songs"].as_array().cloned().unwrap_or_default();
    let song_count = result["songCount"].as_u64().unwrap_or(0) as u32;

    let unified_tracks = songs.into_iter().map(|s| map_song_to_unified(&s, "netease")).collect();

    UnifiedSearchBatch {
        platform: "netease".to_string(),
        tracks: unified_tracks,
        total: song_count,
        has_more: song_count > 0,
    }
}

pub fn map_playlist_detail(body: &Value) -> UnifiedPlaylist {
    let pl = &body["playlist"];
    let tracks = pl["tracks"].as_array().cloned().unwrap_or_default();
    
    UnifiedPlaylist {
        id: pl["id"].to_string(),
        platform: "netease".to_string(),
        name: pl["name"].as_str().unwrap_or("Unknown Playlist").to_string(),
        description: pl["description"].as_str().map(|s| s.to_string()),
        cover_url: pl["coverImgUrl"].as_str().map(|u| u.to_string()),
        track_count: Some(tracks.len() as u32),
        creator: pl["creator"]["nickname"].as_str().map(|s| s.to_string()),
    }
}

pub fn map_artist_detail(body: &Value) -> UnifiedArtistDetail {
    // Handling artist detail from head/info/get
    let artist = &body["data"]["artist"];
    let id = artist["id"].to_string();
    let name = artist["name"].as_str().unwrap_or("Unknown").to_string();
    
    UnifiedArtistDetail {
        id,
        platform: "netease".to_string(),
        name,
        avatar_url: artist["picUrl"].as_str().map(|u| u.to_string()),
        description: artist["briefDesc"].as_str().map(|s| s.to_string()),
        track_count: artist["musicSize"].as_u64().map(|v| v as u32),
        album_count: artist["albumSize"].as_u64().map(|v| v as u32),
        popular_songs: vec![], // Need another API call for these
        albums: vec![],
    }
}

pub fn map_album_detail(body: &Value) -> UnifiedAlbumDetail {
    let album = &body["album"];
    let tracks = body["songs"].as_array().cloned().unwrap_or_default()
        .into_iter().map(|s| map_song_to_unified(&s, "netease")).collect();

    UnifiedAlbumDetail {
        id: album["id"].to_string(),
        platform: "netease".to_string(),
        name: album["name"].as_str().unwrap_or("Unknown").to_string(),
        artist_name: album["artist"]["name"].as_str().unwrap_or("Unknown").to_string(),
        cover_url: album["picUrl"].as_str().map(|u| u.to_string()),
        description: album["description"].as_str().map(|s| s.to_string()),
        release_date: album["publishTime"].as_u64().map(|t| t.to_string()), // timestamp
        track_count: Some(album["size"].as_u64().unwrap_or(0) as u32),
        tracks,
    }
}

// For multiple songs detail
pub fn map_songs_detail(body: &Value) -> Vec<UnifiedTrack> {
    body["songs"].as_array().cloned().unwrap_or_default()
        .into_iter()
        .map(|s| map_song_to_unified(&s, "netease"))
        .collect()
}
