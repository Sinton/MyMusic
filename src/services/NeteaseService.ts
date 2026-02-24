import { invoke } from '@tauri-apps/api/core';


interface HttpResponse {
    status: number;
    body: any;
    headers: Record<string, string>;
}

export const NeteaseService = {
    /**
     * Internal: call Rust backend to make HTTP request
     */
    async _request(apiName: string, params: string = '', cookie: string = ''): Promise<HttpResponse & { data: any }> {
        try {
            const response = await invoke('request_api', {
                provider: 'netease',
                apiName,
                params,
                cookie,
            });
            // Map Rust HttpResponse to object with data property for compatibility
            const anyResp = response as any;
            return {
                status: anyResp.status,
                headers: anyResp.headers,
                body: anyResp.body,
                data: anyResp.body
            };
        } catch (e) {
            console.error('_request error:', e);
            throw e;
        }
    },

    // ========== QR Login ==========

    /** Step 1: Get a unique key for QR code */
    async getQrKey(cookie: string = ''): Promise<{ code: number; unikey: string }> {
        const resp = await this._request('login_qr_key', '', cookie);
        return resp.data;
    },

    /** Step 2: Generate QR code URL from key */
    async createQrCode(key: string, cookie: string = ''): Promise<any> {
        const resp = await this._request('login_qr_create', `key=${key}`, cookie);
        return resp.data;
    },

    /** Step 3: Poll QR scan status. Returns code: 800(expired), 801(waiting), 802(confirming), 803(success) */
    async checkQrLogin(key: string, cookie: string = ''): Promise<{ code: number; message: string; cookie?: string; nickname?: string; avatarUrl?: string }> {
        const resp = await this._request('login_qr_check', `key=${key}`, cookie);
        console.log('[checkQrLogin] resp.data:', JSON.stringify(resp.data));
        const data = resp.data || {};

        // Extract cookie from Set-Cookie response headers
        let responseCookie = '';
        const headers = resp.headers || {};
        // Note: Rust side joins multiple Set-Cookie headers with ";;" if present
        // Or specific header key might be lowercase
        const setCookie = headers['set-cookie'] || headers['Set-Cookie'] || '';

        if (setCookie) {
            if (setCookie.includes(';;')) {
                responseCookie = setCookie.split(';;').map(c => c.split(';')[0]).join('; ');
            } else {
                responseCookie = setCookie.split(';')[0];
            }
        }

        return {
            code: data.code,
            message: data.message || '',
            cookie: responseCookie || undefined,
            nickname: data.nickname || undefined,
            avatarUrl: data.avatarUrl || undefined,
        };
    },

    /** Get login status with cookies */
    async getLoginStatus(cookie: string): Promise<any> {
        const resp = await this._request('login_status', '', cookie);
        return resp.data;
    },

    /** Send SMS captcha to phone number */
    async sendCaptcha(phone: string, ctcode: string = '86'): Promise<any> {
        const resp = await this._request('captcha_sent', `phone=${phone}&ctcode=${ctcode}`);
        return resp.data;
    },

    /** Login with phone + captcha verification code */
    async loginCellphone(phone: string, captcha: string, ctcode: string = '86'): Promise<{ data: any; cookie: string }> {
        const resp = await this._request('login_cellphone', `phone=${phone}&captcha=${captcha}&ctcode=${ctcode}`);
        const data = resp.data || {};

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
    async logout(cookie: string): Promise<any> {
        const resp = await this._request('logout', '', cookie);
        return resp.data;
    },

    // ========== Song ==========

    /** Get song playback URL */
    async getSongUrl(id: number | string, cookie: string = '', level: string = 'standard'): Promise<any> {
        const resp = await this._request('song_url_v1', `id=${id}&level=${level}`, cookie);
        invoke('log_info', { message: `[NeteaseService] getSongUrl data: ${JSON.stringify(resp.data)}` }).catch(() => { });
        return resp.data;
    },

    /** Get song detail */
    async getSongDetail(ids: string, cookie: string = ''): Promise<any> {
        const resp = await this._request('song_detail', `ids=${ids}`, cookie);
        return resp.data;
    },

    /** Get lyrics */
    async getLyric(id: number | string, cookie: string = ''): Promise<any> {
        const resp = await this._request('lyric', `id=${id}`, cookie);
        return resp.data;
    },

    // ========== Playlist ==========

    /** Get user playlists */
    async getUserPlaylists(uid: number | string, cookie: string = '', limit: number = 30, offset: number = 0): Promise<any> {
        const resp = await this._request('user_playlist', `uid=${uid}&limit=${limit}&offset=${offset}`, cookie);
        return resp.data;
    },

    /** Get playlist detail */
    async getPlaylistDetail(id: number | string, cookie: string = ''): Promise<any> {
        const resp = await this._request('playlist_detail', `id=${id}`, cookie);
        return resp.data;
    },

    // ========== Search ==========

    /** Search songs/playlists/etc */
    async search(keywords: string, cookie: string = '', type: number = 1, limit: number = 30, offset: number = 0): Promise<any> {
        const resp = await this._request('search', `keywords=${keywords}&type=${type}&limit=${limit}&offset=${offset}`, cookie);
        return resp.data;
    },

    // ========== User ==========

    /** Get user account info */
    async getUserAccount(cookie: string): Promise<any> {
        const resp = await this._request('user_account', '', cookie);
        return resp.data;
    },

    // ========== Recommend ==========

    /** Get recommended playlists (requires login) */
    async getRecommendResource(cookie: string): Promise<any> {
        const resp = await this._request('recommend_resource', '', cookie);
        return resp.data;
    },

    /** Get recommended songs (requires login) */
    async getRecommendSongs(cookie: string): Promise<any> {
        const resp = await this._request('recommend_songs', '', cookie);
        return resp.data;
    },

    /** Get personalized playlists (no login required) */
    async getPersonalized(cookie: string = '', limit: number = 30): Promise<any> {
        const resp = await this._request('personalized', `limit=${limit}`, cookie);
        return resp.data;
    },

    /** Get newest albums */
    async getAlbumNewest(cookie: string = ''): Promise<any> {
        const resp = await this._request('album_newest', '', cookie);
        return resp.data;
    },

    /** Get album detail by id */
    async getAlbumDetail(id: number | string, cookie: string = ''): Promise<any> {
        const resp = await this._request('album_detail', `id=${id}`, cookie);
        return resp.data;
    },

    /** Get all toplists */
    async getToplist(cookie: string = ''): Promise<any> {
        const resp = await this._request('toplist', '', cookie);
        return resp.data;
    },
};
