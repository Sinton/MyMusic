use super::super::models::{MusicTrack, MusicArtist, MusicAlbum, MusicSearchBatch, MusicPlaylist, MusicArtistDetail, MusicAlbumDetail, MusicComments, MusicComment, MusicCommentUser, MusicAuthResponse, MusicAuthStatus};
use serde_json::Value;
use crate::http::HttpResponse;

pub fn map_auth_response(resp: &HttpResponse, action_name: &str) -> MusicAuthResponse {
    let body = &resp.body;
    let auth_id = body["unikey"].as_str()
        .or(body["codekey"].as_str())
        .unwrap_or("").to_string();

    let status = if action_name == "auth_qr_init" {
        MusicAuthStatus::Waiting
    } else {
        match body["code"].as_i64() {
            Some(801) => MusicAuthStatus::Waiting,
            Some(802) => MusicAuthStatus::Scanned,
            Some(803) => MusicAuthStatus::Success,
            Some(800) => MusicAuthStatus::Expired,
            _ => {
                let msg = body["message"].as_str().or(body["msg"].as_str())
                    .unwrap_or("Unknown status");
                MusicAuthStatus::Error(msg.to_string())
            }
        }
    };

    let qr_data = if action_name == "auth_qr_init" {
        // Netease qr_create returns data.qrimg which is a base64 string
        body["data"]["qrimg"].as_str().map(|s| s.to_string())
    } else {
        None
    };

    MusicAuthResponse {
        platform: "netease".to_string(),
        action: action_name.to_string(),
        auth_id,
        qr_data,
        status,
        nickname: body["nickname"].as_str()
            .or(body["profile"]["nickname"].as_str())
            .map(|s| s.to_string()),
        avatar: body["avatarUrl"].as_str()
            .or(body["profile"]["avatarUrl"].as_str())
            .map(|s| s.to_string()),
        cookie: body["cookie"].as_str().map(|s| s.to_string()),
    }
}

pub fn map_song_to_music(s: &Value, platform: &str) -> MusicTrack {
    let artists = s["ar"].as_array().or(s["singer"].as_array()).cloned().unwrap_or_default().into_iter().map(|ar| {
        MusicArtist {
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

        Some(MusicAlbum {
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

    MusicTrack {
        song_id: s["id"].to_string(),
        platform: platform.to_string(),
        title: s["name"].as_str().unwrap_or("Unknown Track").to_string(),
        artists,
        album,
        duration: duration_sec,
        cover_url: if platform == "netease" { s["al"]["picUrl"].as_str().map(|u| u.to_string()) } else { None }, // QQ cover is handled in album
        raw_url: None,
        vip: s["fee"].as_u64().unwrap_or(0) == 1,
        song_mid: None,
    }
}

pub fn map_search_response(body: &Value) -> MusicSearchBatch {
    let result = &body["result"];
    let songs = result["songs"].as_array().cloned().unwrap_or_default();
    let song_count = result["songCount"].as_u64().unwrap_or(0) as u32;

    let unified_tracks = songs.into_iter().map(|s| map_song_to_music(&s, "netease")).collect();

    MusicSearchBatch {
        platform: "netease".to_string(),
        tracks: unified_tracks,
        total: song_count,
        has_more: song_count > 0,
    }
}

pub fn map_playlist_detail(body: &Value) -> MusicPlaylist {
    let pl = &body["playlist"];
    let tracks = pl["tracks"].as_array().cloned().unwrap_or_default();
    
    MusicPlaylist {
        id: pl["id"].to_string(),
        platform: "netease".to_string(),
        name: pl["name"].as_str().unwrap_or("Unknown Playlist").to_string(),
        description: pl["description"].as_str().map(|s| s.to_string()),
        cover_url: pl["coverImgUrl"].as_str().map(|u| u.to_string()),
        track_count: Some(tracks.len() as u32),
        creator: pl["creator"]["nickname"].as_str().map(|s| s.to_string()),
    }
}

pub fn map_artist_detail(body: &Value) -> MusicArtistDetail {
    // Handling artist detail from head/info/get
    let artist = &body["data"]["artist"];
    let id = artist["id"].to_string();
    let name = artist["name"].as_str().unwrap_or("Unknown").to_string();
    
    MusicArtistDetail {
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

pub fn map_album_detail(body: &Value) -> MusicAlbumDetail {
    let album = &body["album"];
    let tracks = body["songs"].as_array().cloned().unwrap_or_default()
        .into_iter().map(|s| map_song_to_music(&s, "netease")).collect();

    MusicAlbumDetail {
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
pub fn map_songs_detail(body: &Value) -> Vec<MusicTrack> {
    body["songs"].as_array().cloned().unwrap_or_default()
        .into_iter()
        .map(|s| map_song_to_music(&s, "netease"))
        .collect()
}

pub fn map_comments(body: &Value) -> MusicComments {
    let total = body["total"].as_u64().unwrap_or(0) as u32;
    // Netease API uses 'more' in comments API and 'hasMore' in hotcomments API
    let has_more = body["more"].as_bool()
        .or_else(|| body["hasMore"].as_bool())
        .unwrap_or(false);

    let map_comment_fn = |c: &Value| {
        MusicComment {
            id: c["commentId"].to_string(),
            content: c["content"].as_str().unwrap_or("").to_string(),
            time: c["time"].as_u64().unwrap_or(0),
            liked_count: c["likedCount"].as_u64().unwrap_or(0) as u32,
            user: MusicCommentUser {
                id: c["user"]["userId"].to_string(),
                nickname: c["user"]["nickname"].as_str().unwrap_or("Unknown").to_string(),
                avatar_url: c["user"]["avatarUrl"].as_str().map(|s| s.to_string()),
                vip_icon_url: c["user"]["vipRights"]["associator"]["iconUrl"].as_str().map(|s| s.to_string()),
            },
            replying_to: c["beReplied"].as_array().and_then(|a| a.first()).and_then(|r| r["content"].as_str()).map(|s| s.to_string()),
            liked: c["liked"].as_bool().unwrap_or(false),
        }
    };

    let hot_comments: Option<Vec<MusicComment>> = body["hotComments"].as_array()
        .map(|list| list.iter().map(map_comment_fn).collect());
    
    let mut comments: Vec<MusicComment> = body["comments"].as_array()
        .map(|list| list.iter().map(map_comment_fn).collect())
        .unwrap_or_default();

    // If calling song_hot_comments, the data is in hotComments field but we want it in comments for paging
    if comments.is_empty() {
        if let Some(ref h) = hot_comments {
            comments = h.clone();
        }
    }

    MusicComments {
        platform: "netease".to_string(),
        total,
        has_more,
        comments,
        hot_comments,
    }
}
