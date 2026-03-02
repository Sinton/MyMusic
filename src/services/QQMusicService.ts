import { invoke } from '@tauri-apps/api/core';
import type { QQSearchResponse, QQMusicuResponse, QQUser } from '../types/api/qqmusic';

export const QQMusicService = {
    /**
     * Call QQ Music API via Rust backend provider
     */
    async _requestApi<T>(apiName: string, params: Record<string, any> = {}, cookie: string = ''): Promise<T> {
        const paramString = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
            .join('&');

        const res = await invoke<any>('request_api', {
            provider: 'qqmusic',
            apiName,
            params: paramString,
            cookie
        });

        invoke('log_info', { message: `[QQMusicService] API: ${apiName} Params: ${paramString} Response: ${JSON.stringify(res.body).slice(0, 200)}...` });
        return res.body as T;
    },

    /**
     * Extract essential user tracking values from Cookie
     */
    _getCookieVals(cookie: string): { guid: string, uin: string } {
        const guidMatch = cookie.match(/(?:^|;\s*)(?:pgv_pvid|guid)=([^;]+)/);
        const uinMatch = cookie.match(/(?:^|;\s*)(?:qqmusic_uin|wxuin|pt2gguin|uin)=o?([^;]+)/);

        let guid = guidMatch ? guidMatch[1] : '1000000000';
        let uin = uinMatch ? uinMatch[1] : '0';
        if (uin.startsWith('0')) uin = uin.replace(/^0+/, '');

        return { guid, uin };
    },

    /**
     * Search songs via new API (2025.9 confirmed working)
     */
    async searchMusic(keyword: string, cookie?: string): Promise<QQSearchResponse> {
        // We pass the keyword as-is to the params. 
        // Rust's parse_params doesn't decode, so if we encodeURIComponent here, 
        // the Rust side ends up with %E5... in the JSON query.
        // We use a custom encoding that Rust can handle easily, or just raw if it's safe.
        return this._requestApi<QQSearchResponse>('search', { keyword }, cookie || '');
    },

    /**
     * Get real playable mp3/m4a URLs via vkey
     */
    async getSongUrl(songmid: string, cookie: string = ''): Promise<string[]> {
        const data = await this._requestApi<QQMusicuResponse>('song_url', { id: songmid }, cookie);

        if (!data?.req_1?.data?.midurlinfo || data.req_1.data.midurlinfo.length === 0) {
            return [];
        }

        const validInfo = data.req_1.data.midurlinfo.find(info => !!info.purl);
        if (!validInfo) return [];

        const sips = data.req_1.data.sip || [
            "http://ws.stream.qqmusic.qq.com/",
            "http://dl.stream.qqmusic.qq.com/"
        ];

        return sips.map(sip => `${sip}${validInfo.purl}`);
    },

    /**
     * Get user's playlists (self-created and collected)
     */
    async getUserPlaylists(cookie: string): Promise<any> {
        const { uin } = this._getCookieVals(cookie);
        return this._requestApi<any>('user_playlists', { uin }, cookie);
    },

    /**
     * Get song lyrics (2025 format via cgi-bin)
     */
    async getLyric(songmid: string, cookie: string = ''): Promise<{ lyric: string; trans: string }> {
        const data = await this._requestApi<any>('lyric', { songmid }, cookie);

        let lyric = '';
        let trans = '';

        const decodeB64 = (str: string) => {
            try {
                const bytes = Uint8Array.from(window.atob(str), c => c.charCodeAt(0));
                return new TextDecoder('utf-8').decode(bytes);
            } catch {
                return '';
            }
        };

        if (data?.lyric) {
            lyric = decodeB64(data.lyric);
        }
        if (data?.trans) {
            trans = decodeB64(data.trans);
        }

        return { lyric, trans };
    },

    /**
     * Validate Cookie and get user info
     */
    async getLoginStatus(cookie: string): Promise<QQUser | null> {
        try {
            const { uin } = this._getCookieVals(cookie);
            if (!uin || uin === '0') {
                return null;
            }

            return {
                uin,
                nickname: `QQ User (${uin.slice(-4)})`,
                avatarUrl: `https://q1.qlogo.cn/g?b=qq&nk=${uin}&s=100`,
                vipType: cookie.includes('vip_type') ? 1 : 0
            };
        } catch (e) {
            return null;
        }
    },

    // Artist Detail & Songs
    async getArtistDetail(artistMid: string) {
        return this._requestApi<any>('artist_detail', { mid: artistMid });
    },

    async getArtistSongs(artistMid: string, page = 0) {
        return this._requestApi<any>('artist_songs', { mid: artistMid, page });
    },

    async getArtistAlbums(artistMid: string, begin = 0) {
        return this._requestApi<any>('artist_albums', { mid: artistMid, begin });
    },

    // Album Detail
    async getAlbumDetail(albumMid: string) {
        return this._requestApi<any>('album_detail', { mid: albumMid });
    }
};
