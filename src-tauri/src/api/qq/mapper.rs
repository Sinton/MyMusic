use crate::api::models::{MusicTrack, MusicArtist, MusicAlbum, MusicSearchBatch, MusicPlaylist, MusicArtistDetail, MusicAlbumDetail, MusicComments, MusicComment, MusicCommentUser};
use serde_json::Value;

pub fn map_song_to_music(s: &Value, platform: &str) -> MusicTrack {
    let singers = s["singer"].as_array().cloned().unwrap_or_default();
    let artists = singers.into_iter().map(|singer| {
        MusicArtist {
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

        Some(MusicAlbum {
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

    MusicTrack {
        id: s["id"].to_string(),
        platform: platform.to_string(),
        title: s["name"].as_str().unwrap_or("Unknown Track").to_string(),
        artists,
        album,
        duration: s["interval"].as_u64().unwrap_or(0) as u32,
        cover_url,
        raw_url: None,
        vip: s["pay"]["pay_play"].as_u64().unwrap_or(0) == 1,
    }
}

pub fn map_search_response(body: &Value) -> MusicSearchBatch {
    let search_data = &body["search"]["data"];
    let song_list = search_data["song"]["list"].as_array().cloned().unwrap_or_default();
    let total = search_data["song"]["totalnum"].as_u64().unwrap_or(0) as u32;

    let unified_tracks = song_list.into_iter().map(|s| map_song_to_music(&s, "qq")).collect();

    MusicSearchBatch {
        platform: "qq".to_string(),
        tracks: unified_tracks,
        total,
        has_more: total > 0,
    }
}

pub fn map_playlist_detail(body: &Value) -> MusicPlaylist {
    let data = &body["cdlist"][0]; 
    
    MusicPlaylist {
        id: data["disstid"].as_str().unwrap_or("0").to_string(),
        platform: "qq".to_string(),
        name: data["dissname"].as_str().unwrap_or("Unknown Playlist").to_string(),
        description: data["desc"].as_str().map(|s| s.to_string()),
        cover_url: data["logo"].as_str().map(|u| u.to_string()),
        track_count: data["songnum"].as_u64().map(|n| n as u32),
        creator: data["nickname"].as_str().map(|s| s.to_string()),
    }
}

pub fn map_artist_detail(body: &Value) -> MusicArtistDetail {
    let data = &body["req"]["data"];
    let singer_info = &data["singer_info"];
    let mid = singer_info["mid"].as_str().unwrap_or("").to_string();
    let name = singer_info["name"].as_str().unwrap_or("Unknown").to_string();

    MusicArtistDetail {
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

pub fn map_album_detail(body: &Value) -> MusicAlbumDetail {
    let album_info = &body["req"]["data"]["basic_info"];
    let song_list = body["req_1"]["data"]["song_list"].as_array().cloned().unwrap_or_default()
        .into_iter().map(|s| map_song_to_music(&s, "qq")).collect();

    let mid = album_info["album_mid"].as_str().unwrap_or("").to_string();

    MusicAlbumDetail {
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

pub fn map_songs_detail(body: &Value) -> Vec<MusicTrack> {
    let list = body["songlist"].as_array().or(body["data"].as_array()).cloned().unwrap_or_default();
    list.into_iter().map(|s| map_song_to_music(&s, "qq")).collect()
}

fn process_qq_content(content: &str) -> String {
    lazy_static::lazy_static! {
        static ref RE: regex::Regex = regex::Regex::new(r"\[em\]e(\d+)\[/em\]").unwrap();
    }
    RE.replace_all(content, |caps: &regex::Captures| {
        format!(
            "<img src=\"https://y.qq.com/mediastyle/global/emoji/img/e{}@2x.png?max_age=2592000\" class=\"qq-emoji\" style=\"display:inline-block; vertical-align: -3px; width:18px; height:18px; margin: 0 1px;\" />",
            &caps[1]
        )
    }).to_string()
}

pub fn map_comments(body: &Value) -> MusicComments {
    let mut total = 0;
    let mut comment_list_json = None;
    let mut hot_comment_list_json = None;

    if body["req_1"]["data"].is_object() {
        // RPC format
        let req_data = &body["req_1"]["data"];
        total = req_data["totalNum"].as_u64().unwrap_or(0) as u32;
        comment_list_json = req_data["commentList"].as_array();
        hot_comment_list_json = req_data["hotComment"]["commentList"].as_array();
    } else {
        // Legacy H5 format
        total = body["comment"]["commenttotal"].as_u64()
            .or(body["commenttotal"].as_u64())
            .or(body["totalNum"].as_u64())
            .unwrap_or(0) as u32;
        
        // Check for comment.commentlist first (Latest or Cmd=9 Hot)
        comment_list_json = body["comment"]["commentlist"].as_array();
        
        // If not found, try root commentlist
        if comment_list_json.is_none() {
            comment_list_json = body["commentlist"].as_array();
        }

        hot_comment_list_json = body["hot_comment"]["commentlist"].as_array();
    }

    let has_more_from_api = body["morecomment"].as_u64().map(|n| n == 1);

    let map_comment_fn = |c: &Value| {
        let user_id = c["userId"].as_str()
            .map(|s| s.to_string())
            .or_else(|| c["uin"].as_u64().map(|n| n.to_string()))
            .unwrap_or_default();

        let raw_content = c["content"].as_str()
            .or(c["rootcommentcontent"].as_str())
            .unwrap_or("")
            .replace("\\n", "<br />")
            .replace("\n", "<br />");
        
        let content = process_qq_content(&raw_content);

        MusicComment {
            id: c["commentid"].as_str()
                .or(c["commentId"].as_str())
                .unwrap_or("")
                .to_string(),
            content,
            time: c["time"].as_u64().unwrap_or(0) * 1000, 
            liked_count: c["praisenum"].as_u64()
                .or(c["praiseNum"].as_u64())
                .unwrap_or(0) as u32,
            user: MusicCommentUser {
                id: user_id,
                nickname: c["nick"].as_str()
                    .or(c["nickname"].as_str())
                    .unwrap_or("Unknown").to_string(),
                avatar_url: c["avatarurl"].as_str().map(|s| s.to_string()),
                vip_icon_url: c["vipicon"].as_str().map(|s| s.to_string()),
            },
            replying_to: None, 
            liked: c["isPraise"].as_u64().or(c["is_praise"].as_u64()).unwrap_or(0) == 1,
        }
    };

    let hot_comments: Option<Vec<MusicComment>> = hot_comment_list_json
        .map(|list| list.iter().map(map_comment_fn).collect());
    
    let comments: Vec<MusicComment> = comment_list_json
        .map(|list| list.iter().map(map_comment_fn).collect())
        .unwrap_or_default();

    // Use morecomment from API if available, otherwise fallback to total vs length logic
    let has_more = has_more_from_api.unwrap_or(total > comments.len() as u32 && comments.len() >= 10);

    MusicComments {
        platform: "qq".to_string(),
        total,
        has_more,
        comments,
        hot_comments,
    }
}
