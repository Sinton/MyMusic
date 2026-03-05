use crate::api::models::{UnifiedTrack, UnifiedArtist, UnifiedAlbum, UnifiedSearchBatch, UnifiedPlaylist, UnifiedArtistDetail, UnifiedAlbumDetail};
use serde_json::Value;

pub fn map_song_to_unified(s: &Value, platform: &str) -> UnifiedTrack {
    let singers = s["singer"].as_array().cloned().unwrap_or_default();
    let artists = singers.into_iter().map(|singer| {
        UnifiedArtist {
            id: singer["id"].to_string(),
            name: singer["name"].as_str().unwrap_or("Unknown Artist").to_string(),
        }
    }).collect();

    let album_data = if s["album"].is_object() { &s["album"] } else { &s["album"] };
    let album = if album_data.is_object() {
        let album_mid = album_data["mid"].as_str().unwrap_or("");
        let cover_url = if !album_mid.is_empty() {
            Some(format!("https://y.gtimg.cn/music/photo_new/T002R300x300M000{}.jpg", album_mid))
        } else {
            None
        };

        Some(UnifiedAlbum {
            id: album_data["id"].to_string(),
            name: album_data["name"].as_str().unwrap_or("Unknown Album").to_string(),
            cover_url,
        })
    } else {
        None
    };

    let track_mid = s["mid"].as_str().unwrap_or("");
    let cover_url = if !track_mid.is_empty() {
         Some(format!("https://y.gtimg.cn/music/photo_new/T002R300x300M000{}.jpg", s["album"]["mid"].as_str().unwrap_or("")))
    } else {
        None
    };

    UnifiedTrack {
        id: s["id"].to_string(),
        platform: platform.to_string(),
        title: s["name"].as_str().unwrap_or("Unknown Track").to_string(),
        artists,
        album,
        duration: s["interval"].as_u64().unwrap_or(0) as u32,
        cover_url,
        raw_url: None,
    }
}

pub fn map_search_response(body: &Value) -> UnifiedSearchBatch {
    let search_data = &body["search"]["data"];
    let song_list = search_data["song"]["list"].as_array().cloned().unwrap_or_default();
    let total = search_data["song"]["totalnum"].as_u64().unwrap_or(0) as u32;

    let unified_tracks = song_list.into_iter().map(|s| map_song_to_unified(&s, "qq")).collect();

    UnifiedSearchBatch {
        platform: "qq".to_string(),
        tracks: unified_tracks,
        total,
        has_more: total > 0,
    }
}

pub fn map_playlist_detail(body: &Value) -> UnifiedPlaylist {
    let data = &body["cdlist"][0]; 
    
    UnifiedPlaylist {
        id: data["disstid"].as_str().unwrap_or("0").to_string(),
        platform: "qq".to_string(),
        name: data["dissname"].as_str().unwrap_or("Unknown Playlist").to_string(),
        description: data["desc"].as_str().map(|s| s.to_string()),
        cover_url: data["logo"].as_str().map(|u| u.to_string()),
        track_count: data["songnum"].as_u64().map(|n| n as u32),
        creator: data["nickname"].as_str().map(|s| s.to_string()),
    }
}

pub fn map_artist_detail(body: &Value) -> UnifiedArtistDetail {
    let data = &body["req"]["data"];
    let singer_info = &data["singer_info"];
    let mid = singer_info["mid"].as_str().unwrap_or("").to_string();
    let name = singer_info["name"].as_str().unwrap_or("Unknown").to_string();

    UnifiedArtistDetail {
        id: mid.clone(),
        platform: "qq".to_string(),
        name,
        avatar_url: Some(format!("https://y.gtimg.cn/music/photo_new/T001R300x300M000{}.jpg", mid)),
        description: singer_info["desc"].as_str().map(|s| s.to_string()),
        track_count: singer_info["total_song"].as_u64().map(|v| v as u32),
        album_count: singer_info["total_album"].as_u64().map(|v| v as u32),
        popular_songs: vec![], 
        albums: vec![],
    }
}

pub fn map_album_detail(body: &Value) -> UnifiedAlbumDetail {
    let album_info = &body["req"]["data"]["basic_info"];
    let song_list = body["req_1"]["data"]["song_list"].as_array().cloned().unwrap_or_default()
        .into_iter().map(|s| map_song_to_unified(&s, "qq")).collect();

    let mid = album_info["album_mid"].as_str().unwrap_or("").to_string();

    UnifiedAlbumDetail {
        id: mid.clone(),
        platform: "qq".to_string(),
        name: album_info["album_name"].as_str().unwrap_or("Unknown").to_string(),
        artist_name: album_info["singer_name"].as_str().unwrap_or("Unknown").to_string(),
        cover_url: Some(format!("https://y.gtimg.cn/music/photo_new/T002R300x300M000{}.jpg", mid)),
        description: album_info["desc"].as_str().map(|s| s.to_string()),
        release_date: album_info["pub_time"].as_str().map(|s| s.to_string()),
        track_count: album_info["cur_song_num"].as_u64().map(|v| v as u32),
        tracks: song_list,
    }
}

pub fn map_songs_detail(body: &Value) -> Vec<UnifiedTrack> {
    let list = body["songlist"].as_array().or(body["data"].as_array()).cloned().unwrap_or_default();
    list.into_iter().map(|s| map_song_to_unified(&s, "qq")).collect()
}