use crate::api::models::{MusicTrack, MusicArtist, MusicAlbum, MusicArtistDetail, MusicAlbumDetail};
use serde_json::{json, Value};

pub fn map_song_to_music(s: &Value) -> MusicTrack {
    let artists = s["artists"].as_array().cloned().unwrap_or_default().into_iter().map(|ar| {
        MusicArtist {
            id: ar["id"].to_string(),
            name: ar["name"].as_str().unwrap_or("Unknown Artist").to_string(),
        }
    }).collect();

    let album = if s["album"].is_object() {
        Some(MusicAlbum {
            id: s["album"]["id"].to_string(),
            name: s["album"]["name"].as_str().unwrap_or("Unknown Album").to_string(),
            cover_url: s["cover"].as_str().or(s["album"]["cover_url"].as_str()).map(|u| u.to_string()),
        })
    } else {
        None
    };

    MusicTrack {
        id: s["id"].to_string(),
        platform: "qishui".to_string(),
        title: s["title"].as_str().unwrap_or(s["name"].as_str().unwrap_or("Unknown Track")).to_string(),
        artists,
        album,
        duration: (s["duration_ms"].as_u64().unwrap_or(0) / 1000) as u32,
        cover_url: s["cover"].as_str().or(s["album"]["cover_url"].as_str()).map(|u| u.to_string()),
        raw_url: None,
        vip: false, // Default to false for Qishui for now
    }
}

pub fn map_track_detail(body: &Value) -> MusicTrack {
    map_song_to_music(&body["data"])
}

pub fn map_artist_detail(body: &Value) -> MusicArtistDetail {
    let data = &body["data"];
    let id = data["artistId"].as_str().unwrap_or("").to_string();
    let name = data["name"].as_str().unwrap_or("Unknown").to_string();
    
    let popular_songs = data["trackList"].as_array().cloned().unwrap_or_default()
        .into_iter().map(|s| map_song_to_music(&s)).collect();

    let albums = data["albumList"].as_array().cloned().unwrap_or_default()
        .into_iter().map(|a| {
            MusicAlbum {
                id: a["id"].to_string(),
                name: a["name"].as_str().unwrap_or("Unknown").to_string(),
                cover_url: a["cover"].as_str().map(|u| u.to_string()),
            }
        }).collect();

    MusicArtistDetail {
        id,
        platform: "qishui".to_string(),
        name,
        avatar_url: data["avatar"].as_str().map(|u| u.to_string()),
        description: data["profile"].as_str().map(|s| s.to_string()),
        track_count: data["countTracks"].as_u64().map(|v| v as u32),
        album_count: data["countAlbums"].as_u64().map(|v| v as u32),
        popular_songs,
        albums,
    }
}

pub fn map_album_detail(body: &Value) -> MusicAlbumDetail {
    let data = &body["data"];
    let tracks = data["trackList"].as_array().cloned().unwrap_or_default()
        .into_iter().map(|s| map_song_to_music(&s)).collect();

    let artist_name = data["artists"].as_array().and_then(|a| a[0]["name"].as_str()).unwrap_or("Unknown").to_string();

    MusicAlbumDetail {
        id: data["albumId"].to_string(),
        platform: "qishui".to_string(),
        name: data["name"].as_str().unwrap_or("Unknown").to_string(),
        artist_name,
        cover_url: data["cover"].as_str().map(|u| u.to_string()),
        description: None,
        release_date: data["releaseDate"].as_i64().map(|t| t.to_string()),
        track_count: data["countTracks"].as_u64().map(|v| v as u32),
        tracks,
    }
}
