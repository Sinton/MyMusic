// Types for QQ Music API responses (2025.9 API format)

export interface QQUser {
    uin: number | string;
    nickname: string;
    avatarUrl: string;
    vipType: number;
}

// New search API response format (POST u.y.qq.com/cgi-bin/musicu.fcg)
export interface QQSearchResponse {
    code: number;
    req: {
        code: number;
        data: {
            body: {
                song: {
                    list: QQSongItem[];
                    totalnum: number;
                };
            };
        };
    };
}

export interface QQSongItem {
    mid: string;          // songmid
    name: string;         // song name
    title: string;        // song title (usually same as name)
    singer: { id: number; mid: string; name: string }[];
    album: {
        id: number;
        mid: string;
        name: string;
    };
    interval: number;     // duration in seconds
    pay?: { pay_play: number; pay_down: number };
}

// Legacy type alias for backward compat
export interface QQSearchResult {
    code: number;
    data: {
        song: {
            list: QQAuthSong[];
            totalnum: number;
        }
    }
}

export interface QQAuthSong {
    songmid: string;
    songname: string;
    singer: { id: number; mid: string; name: string }[];
    albumname: string;
    albummid: string;
    interval: number;
    pay?: { payplay: number; paydownload: number };
}

export interface QQMusicuResponse {
    code: number;
    req_1?: {
        code: number;
        data?: {
            midurlinfo?: {
                songmid: string;
                filename?: string;
                purl: string;
                vkey: string;
            }[];
            sip?: string[];
        }
    }
}
