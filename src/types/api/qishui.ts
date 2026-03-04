// Types for Qishui Music (汽水音乐 / Douyin Music) API responses

export interface QishuiTrackDetail {
    code: number;
    data: {
        trackId: string;
        title: string;
        artist: string;
        album?: string;
        cover: string;
        url: string;           // Audio playback URL (CDN, may expire)
        durationMs: number;
        releaseDate?: number;
        bitRates?: Array<{ br: number; size: number; quality: string }>;
        labelInfo?: any;
        groupPlayableLevel?: string;
        artistId?: string;
        albumId?: string;
        raw?: Record<string, any>;  // Full track_page SSR data for debugging
    };
}

export interface QishuiLyricResponse {
    code: number;
    data: {
        trackId: string;
        lrc: string;           // Standard LRC format lyrics
    };
}

export interface QishuiValidateResponse {
    code: number;
    data: {
        isQishuiLink: boolean;
        trackId?: string;
        originalUrl?: string;
    };
}

export interface QishuiArtistDetail {
    code: number;
    data: {
        artistId: string;
        name: string;
        avatar: string;
        countAlbums: number;
        countTracks: number;
        profile?: any;
        stats?: {
            count_collected?: number;
            count_comment?: number;
            count_shared?: number;
        };
        trackList: Array<any>;
        albumList: Array<any>;
    };
}

export interface QishuiAlbumDetail {
    code: number;
    data: {
        albumId: string;
        name: string;
        cover: string;
        countTracks: number;
        releaseDate: number;
        artists: Array<{ id: string; name: string }>;
        stats?: {
            count_collected?: number;
            count_comment?: number;
            count_shared?: number;
        };
        trackList: Array<any>;
    };
}
