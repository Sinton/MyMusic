/**
 * Type definitions for the NetEase Cloud Music API responses.
 *
 * These map to the JSON structures returned by the Rust backend's
 * `request_api` command when `provider = "netease"`.
 */

// ================== HTTP Layer ==================

/** The raw response shape from our Rust `request_api` command. */
export interface NeteaseHttpResponse<T = unknown> {
    status: number;
    body: T;
    headers: Record<string, string>;
}

// ================== Song URL ==================

export interface NeteaseSongUrlItem {
    id: number;
    url: string | null;
    br: number;
    size: number;
    time: number;      // duration in milliseconds
    type: string;       // e.g. "mp3"
    level: string;
    code: number;
}

export interface NeteaseSongUrlResponse {
    code: number;
    data: NeteaseSongUrlItem[];
}

// ================== Song Detail ==================

export interface NeteaseArtistBrief {
    id: number;
    name: string;
}

export interface NeteaseAlbumBrief {
    id: number;
    name: string;
    picUrl?: string;
    blurPicUrl?: string;
}

export interface NeteasePrivilege {
    maxbr: number;
    fee: number;
}

export interface NeteaseSongItem {
    id: number;
    name: string;
    ar: NeteaseArtistBrief[];
    al: NeteaseAlbumBrief;
    dt: number;             // duration in milliseconds
    fee: number;            // 0=free, 1=vip
    privilege?: NeteasePrivilege;

    // Legacy field names (some APIs use these instead)
    artists?: NeteaseArtistBrief[];
    album?: NeteaseAlbumBrief;
    duration?: number;
}

export interface NeteaseSongDetailResponse {
    code: number;
    songs: NeteaseSongItem[];
}

// ================== Playlist ==================

export interface NeteasePlaylistCreator {
    nickname: string;
    userId: number;
    avatarUrl?: string;
}

export interface NeteasePlaylistItem {
    id: number;
    name: string;
    trackCount: number;
    coverImgUrl?: string;
    picUrl?: string;
    creator?: NeteasePlaylistCreator;
    tracks?: NeteaseSongItem[];
    subscribed?: boolean;
}

export interface NeteasePlaylistDetailResponse {
    code: number;
    playlist: NeteasePlaylistItem;
}

export interface NeteaseUserPlaylistsResponse {
    code: number;
    playlist: NeteasePlaylistItem[];
}

// ================== Search ==================

export interface NeteaseSearchResult {
    songs?: NeteaseSongItem[];
    songCount?: number;
}

export interface NeteaseSearchResponse {
    code: number;
    result: NeteaseSearchResult;
}

// ================== Album ==================

export interface NeteaseAlbumArtist {
    id: number;
    name: string;
}

export interface NeteaseAlbumFull {
    id: number;
    name: string;
    picUrl?: string;
    blurPicUrl?: string;
    artist?: NeteaseAlbumArtist;
    artists?: NeteaseAlbumArtist[];
    publishTime?: number;
    size?: number;
}

export interface NeteaseAlbumDetailResponse {
    code: number;
    album: NeteaseAlbumFull;
    songs: NeteaseSongItem[];
}

export interface NeteaseAlbumNewestResponse {
    code: number;
    albums: NeteaseAlbumFull[];
}

// ================== Recommend ==================

export interface NeteasePersonalizedItem {
    id: number;
    name: string;
    trackCount: number;
    coverImgUrl?: string;
    picUrl?: string;
    creator?: NeteasePlaylistCreator;
}

export interface NeteasePersonalizedResponse {
    code: number;
    result: NeteasePersonalizedItem[];
}

export interface NeteaseRecommendSongsResponse {
    code: number;
    data?: {
        dailySongs: NeteaseSongItem[];
    };
    recommend?: NeteaseSongItem[];
}

// ================== Toplist ==================

export interface NeteaseToplistResponse {
    code: number;
    list: NeteasePlaylistItem[];
}

// ================== Lyrics ==================

export interface NeteaseLyricResponse {
    code: number;
    lrc?: {
        lyric: string;
    };
    tlyric?: {
        lyric: string;
    };
}

// ================== QR Login ==================

export interface NeteaseQrKeyResponse {
    code: number;
    unikey: string;
}

export interface NeteaseQrCheckResponse {
    code: number;
    message: string;
    nickname?: string;
    avatarUrl?: string;
}

// ================== User ==================

export interface NeteaseUserAccountResponse {
    code: number;
    data?: {
        profile?: {
            nickname: string;
            avatarUrl: string;
            userId: number;
            vipType?: number;
        };
        account?: {
            id: number;
            userName: string;
        };
    };
    account?: {
        id: number;
        userName: string;
    };
    profile?: {
        nickname: string;
        avatarUrl: string;
        userId: number;
        vipType?: number;
    };
}

// ================== Login Cellphone ==================

export interface LoginCellphoneResult {
    code: number;
    message?: string;
    msg?: string;
    profile?: {
        userId: number;
        nickname: string;
        avatarUrl: string;
        vipType?: number;
    };
    account?: {
        id: number;
        userName?: string;
    };
    data?: {
        url?: string;
    };
}
