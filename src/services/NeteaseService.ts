import { invoke } from '@tauri-apps/api/core';
import type {
    NeteaseHttpResponse,
    NeteaseSongUrlResponse,
    NeteaseSongDetailResponse,
    NeteasePlaylistDetailResponse,
    NeteaseUserPlaylistsResponse,
    NeteaseSearchResponse,
    NeteaseAlbumDetailResponse,
    NeteaseAlbumNewestResponse,
    NeteasePersonalizedResponse,
    NeteaseRecommendSongsResponse,
    NeteaseToplistResponse,
    NeteaseLyricResponse,
    NeteaseArtistDetailResponse,
    NeteaseArtistSongsResponse,
    NeteaseArtistAlbumsResponse,
    NeteaseQrKeyResponse,
    NeteaseQrCheckResponse,
    NeteaseUserAccountResponse,
    LoginCellphoneResult,
} from '../types';

/**
 * Typed response from a Rust `request_api` call.
 * `data` is an alias for `body` for backward compatibility.
 */
interface TypedResponse<T> {
    status: number;
    body: T;
    headers: Record<string, string>;
    data: T;
}

export const NeteaseService = {
    /**
     * Internal: call Rust backend to make HTTP request
     */
    async _request<T = unknown>(apiName: string, params: string = '', cookie: string = ''): Promise<TypedResponse<T>> {
        const traceId = Math.random().toString(36).substring(2, 8).toUpperCase();
        try {
            console.log(`[NeteaseService][${traceId}] Requesting API: ${apiName}`, params);
            const response = await invoke('request_api', {
                provider: 'netease',
                apiName,
                params,
                cookie,
                traceId
            });
            const anyResp = response as NeteaseHttpResponse<T>;
            return {
                status: anyResp.status,
                headers: anyResp.headers,
                body: anyResp.body,
                data: anyResp.body,
            };
        } catch (e) {
            console.error('_request error:', e);
            throw e;
        }
    },

    // ========== QR Login ==========

    /** Step 1: Get a unique key for QR code */
    async getQrKey(cookie: string = ''): Promise<NeteaseQrKeyResponse> {
        const resp = await this._request<NeteaseQrKeyResponse>('login_qr_key', '', cookie);
        return resp.data;
    },

    /** Step 2: Generate QR code URL from key */
    async createQrCode(key: string, cookie: string = ''): Promise<{ code: number; data: { qrurl: string; qrimg?: string } }> {
        const resp = await this._request<{ code: number; data: { qrurl: string; qrimg?: string } }>('login_qr_create', `key=${key}`, cookie);
        return resp.data;
    },

    /** Step 3: Poll QR scan status. Returns code: 800(expired), 801(waiting), 802(confirming), 803(success) */
    async checkQrLogin(key: string, cookie: string = ''): Promise<{ code: number; message: string; cookie?: string; nickname?: string; avatarUrl?: string }> {
        const resp = await this._request<NeteaseQrCheckResponse>('login_qr_check', `key=${key}`, cookie);
        // console.log('[checkQrLogin] raw body:', JSON.stringify(resp.data));

        const data = resp.data || {} as NeteaseQrCheckResponse;

        // Extract cookie from Set-Cookie response headers
        let responseCookie = '';
        const headers = resp.headers || {};
        const setCookie = headers['set-cookie'] || headers['Set-Cookie'] || '';

        if (setCookie) {
            // Priority 1: Our custom double semicolon joiner from Rust
            if (setCookie.includes(';;')) {
                responseCookie = setCookie.split(';;').map(c => c.split(';')[0]).join('; ');
            }
            // Priority 2: Standard comma joiner (be careful with dates)
            else if (setCookie.includes(',')) {
                // Try to avoid splitting on dates like "Wed, 21-Oct..."
                // Only split on comma followed by a space if it looks like a new cookie name
                responseCookie = setCookie.split(/,\s(?=[a-zA-Z0-9_-]+=)/).map(c => c.split(';')[0]).join('; ');
            }
            // Priority 3: Single cookie
            else {
                responseCookie = setCookie.split(';')[0];
            }
        }

        // Sometimes the body itself might contain a cookie field for certain versions
        const finalCookie = responseCookie || (data as any).cookie || '';

        return {
            code: data.code,
            message: data.message || '',
            cookie: finalCookie || undefined,
            nickname: data.nickname || undefined,
            avatarUrl: data.avatarUrl || undefined,
        };
    },

    /** Get login status with cookies */
    async getLoginStatus(cookie: string): Promise<NeteaseUserAccountResponse> {
        const resp = await this._request<NeteaseUserAccountResponse>('login_status', '', cookie);
        return resp.data;
    },

    /** Send SMS captcha to phone number */
    async sendCaptcha(phone: string, ctcode: string = '86'): Promise<{ code: number; message?: string; data?: { url?: string } }> {
        const resp = await this._request<{ code: number; message?: string; data?: { url?: string } }>('captcha_sent', `phone=${phone}&ctcode=${ctcode}`);
        return resp.data;
    },

    /** Login with phone + captcha verification code */
    async loginCellphone(phone: string, captcha: string, ctcode: string = '86'): Promise<{ data: LoginCellphoneResult; cookie: string }> {
        const resp = await this._request<LoginCellphoneResult>('login_cellphone', `phone=${phone}&captcha=${captcha}&ctcode=${ctcode}`);
        const data = resp.data ?? {} as LoginCellphoneResult;

        let responseCookie = '';
        const headers = resp.headers || {};
        const setCookie = headers['set-cookie'] || headers['Set-Cookie'] || '';

        if (setCookie) {
            if (setCookie.includes(';;')) {
                responseCookie = setCookie.split(';;').map(c => c.split(';')[0]).join('; ');
            } else {
                responseCookie = setCookie.split(';')[0];
            }
        }

        return { data, cookie: responseCookie };
    },

    /** Logout */
    async logout(cookie: string): Promise<{ code: number }> {
        const resp = await this._request<{ code: number }>('logout', '', cookie);
        return resp.data;
    },

    // ========== Song ==========

    /** Get song playback URL */
    async getSongUrl(id: number | string, cookie: string = '', level: string = 'standard'): Promise<NeteaseSongUrlResponse> {
        const resp = await this._request<NeteaseSongUrlResponse>('song_url_v1', `id=${id}&level=${level}`, cookie);
        invoke('log_info', { message: `[NeteaseService] getSongUrl data: ${JSON.stringify(resp.data)}` }).catch(() => { });
        return resp.data;
    },

    /** Get song detail */
    async getSongDetail(ids: string, cookie: string = ''): Promise<NeteaseSongDetailResponse> {
        const resp = await this._request<NeteaseSongDetailResponse>('song_detail', `ids=${ids}`, cookie);
        return resp.data;
    },

    /** Get lyrics */
    async getLyric(id: number | string, cookie: string = ''): Promise<NeteaseLyricResponse> {
        const resp = await this._request<NeteaseLyricResponse>('lyric', `id=${id}`, cookie);
        return resp.data;
    },

    // ========== Playlist ==========

    /** Get user playlists */
    async getUserPlaylists(uid: number | string, cookie: string = '', limit: number = 30, offset: number = 0): Promise<NeteaseUserPlaylistsResponse> {
        const resp = await this._request<NeteaseUserPlaylistsResponse>('user_playlist', `uid=${uid}&limit=${limit}&offset=${offset}`, cookie);
        return resp.data;
    },

    /** Get playlist detail */
    async getPlaylistDetail(id: number | string, cookie: string = ''): Promise<NeteasePlaylistDetailResponse> {
        const resp = await this._request<NeteasePlaylistDetailResponse>('playlist_detail', `id=${id}`, cookie);
        return resp.data;
    },

    // ========== Search ==========

    /** Search songs/playlists/etc */
    async search(keywords: string, cookie: string = '', type: number = 1, limit: number = 30, offset: number = 0): Promise<NeteaseSearchResponse> {
        const resp = await this._request<NeteaseSearchResponse>('search', `keywords=${keywords}&type=${type}&limit=${limit}&offset=${offset}`, cookie);
        return resp.data;
    },

    // ========== Artist ==========

    /** Get artist detail info */
    async getArtistDetail(id: number | string, cookie: string = ''): Promise<NeteaseArtistDetailResponse> {
        const resp = await this._request<NeteaseArtistDetailResponse>('artist_detail', `id=${id}`, cookie);
        invoke('log_info', { message: `[NeteaseService] getArtistDetail for ${id}: ${JSON.stringify(resp.data).substring(0, 200)}...` }).catch(() => { });
        return resp.data;
    },

    /** Get artist's hot songs (popular tracks) */
    async getArtistSongs(id: number | string, cookie: string = '', limit: number = 100): Promise<NeteaseArtistSongsResponse> {
        const resp = await this._request<NeteaseArtistSongsResponse>('artist_songs', `id=${id}&limit=${limit}`, cookie);
        invoke('log_info', { message: `[NeteaseService] getArtistSongs for ${id}: ${JSON.stringify(resp.data).substring(0, 200)}...` }).catch(() => { });
        return resp.data;
    },

    /** Get artist's albums */
    async getArtistAlbums(id: number | string, cookie: string = '', limit: number = 30, offset: number = 0): Promise<NeteaseArtistAlbumsResponse> {
        const resp = await this._request<NeteaseArtistAlbumsResponse>('artist_album', `id=${id}&limit=${limit}&offset=${offset}`, cookie);
        invoke('log_info', { message: `[NeteaseService] getArtistAlbums for ${id}: more=${resp.data.more}, count=${resp.data.hotAlbums?.length}` }).catch(() => { });
        return resp.data;
    },

    // ========== User ==========

    /** Get user account info */
    async getUserAccount(cookie: string): Promise<NeteaseUserAccountResponse> {
        const resp = await this._request<NeteaseUserAccountResponse>('user_account', '', cookie);
        return resp.data;
    },

    // ========== Recommend ==========

    /** Get recommended playlists (requires login) */
    async getRecommendResource(cookie: string): Promise<NeteasePersonalizedResponse> {
        const resp = await this._request<NeteasePersonalizedResponse>('recommend_resource', '', cookie);
        return resp.data;
    },

    /** Get recommended songs (requires login) */
    async getRecommendSongs(cookie: string): Promise<NeteaseRecommendSongsResponse> {
        const resp = await this._request<NeteaseRecommendSongsResponse>('recommend_songs', '', cookie);
        return resp.data;
    },

    /** Get personalized playlists (no login required) */
    async getPersonalized(cookie: string = '', limit: number = 30): Promise<NeteasePersonalizedResponse> {
        const resp = await this._request<NeteasePersonalizedResponse>('personalized', `limit=${limit}`, cookie);
        return resp.data;
    },

    /** Get newest albums */
    async getAlbumNewest(cookie: string = ''): Promise<NeteaseAlbumNewestResponse> {
        const resp = await this._request<NeteaseAlbumNewestResponse>('album_newest', '', cookie);
        return resp.data;
    },

    /** Get album detail by id */
    async getAlbumDetail(id: number | string, cookie: string = ''): Promise<NeteaseAlbumDetailResponse> {
        const resp = await this._request<NeteaseAlbumDetailResponse>('album_detail', `id=${id}`, cookie);
        return resp.data;
    },

    /** Get all toplists */
    async getToplist(cookie: string = ''): Promise<NeteaseToplistResponse> {
        const resp = await this._request<NeteaseToplistResponse>('toplist', '', cookie);
        return resp.data;
    },
};
