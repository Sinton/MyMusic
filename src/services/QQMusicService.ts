import { invoke } from '@tauri-apps/api/core';
import type { QQSearchResponse, QQMusicuResponse, QQUser } from '../types/api/qqmusic';

export const QQMusicService = {
    /**
     * POST JSON request via Rust backend (bypasses all Tauri HTTP plugin restrictions)
     */
    async _postJson<T>(url: string, body: string, cookie: string = ''): Promise<T> {
        try {
            const bytes: number[] = await invoke('request_bytes', {
                url,
                referer: 'https://y.qq.com/',
                cookie: cookie || null,
                method: 'POST',
                body,
                contentType: 'application/json;charset=utf-8',
            });

            const text = new TextDecoder().decode(new Uint8Array(bytes));
            return JSON.parse(text) as T;
        } catch (e) {
            console.error('[QQMusicService] POST request failed:', url, e);
            throw e;
        }
    },

    /**
     * GET request via Rust backend
     */
    async _get<T>(url: string, cookie: string = ''): Promise<T> {
        try {
            const bytes: number[] = await invoke('request_bytes', {
                url,
                referer: 'https://y.qq.com/',
                cookie: cookie || null,
            });

            const text = new TextDecoder().decode(new Uint8Array(bytes));

            // Handle jsonp callback wrapper
            let jsonString = text;
            const jsonpMatch = text.match(/^\w+\((.*)\)$/);
            if (jsonpMatch) {
                jsonString = jsonpMatch[1];
            }

            return JSON.parse(jsonString) as T;
        } catch (e) {
            console.error('[QQMusicService] GET request failed:', url, e);
            throw e;
        }
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
     * Uses POST https://u.y.qq.com/cgi-bin/musicu.fcg
     * Source: https://github.com/copws/qq-music-api
     */
    async searchMusic(keyword: string, cookie?: string): Promise<QQSearchResponse> {
        const body = JSON.stringify({
            comm: { ct: "19", cv: "1859", uin: "0" },
            req: {
                method: "DoSearchForQQMusicDesktop",
                module: "music.search.SearchCgiService",
                param: {
                    grp: 1,
                    num_per_page: 30,
                    page_num: 1,
                    query: keyword,
                    search_type: 0
                }
            }
        });

        return this._postJson<QQSearchResponse>(
            'https://u.y.qq.com/cgi-bin/musicu.fcg',
            body,
            cookie
        );
    },

    /**
     * Get real playable mp3/m4a URLs via vkey (2025.9 format)
     * Uses POST https://u.y.qq.com/cgi-bin/musicu.fcg
     */
    async getSongUrl(songmid: string, cookie: string = ''): Promise<string[]> {
        const { guid, uin } = this._getCookieVals(cookie);

        // Request order: 320k mp3 -> standard m4a
        // If a user doesn't have VIP, higher qualities will return an empty purl.
        // NOTE: M500 (128k mp3) is omitted because QQ Music's API frequently returns a purl for it,
        // but the CDN yields a 404 Not Found. C400 (m4a) reliably serves free streams.
        const qualities = [
            { reqPrefix: 'M800', reqSuffix: 'mp3' },
            { reqPrefix: 'C400', reqSuffix: 'm4a' }
        ];

        const filenames = qualities.map(q => `${q.reqPrefix}${songmid}${songmid}.${q.reqSuffix}`);
        const songmids = qualities.map(() => songmid);
        const songtypes = qualities.map(() => 0);

        invoke('log_info', { message: `[QQMusicService] getSongUrl: requesting multiple formats for ${songmid}` });

        const body = JSON.stringify({
            req_1: {
                module: "vkey.GetVkeyServer",
                method: "CgiGetVkey",
                param: {
                    filename: filenames,
                    guid,
                    songmid: songmids,
                    songtype: songtypes,
                    uin,
                    loginflag: 1,
                    platform: "20"
                }
            },
            loginUin: uin,
            comm: { uin, format: "json", ct: 24, cv: 0 }
        });

        const data = await this._postJson<QQMusicuResponse>(
            'https://u.y.qq.com/cgi-bin/musicu.fcg',
            body,
            cookie
        );

        if (!data?.req_1?.data?.midurlinfo || data.req_1.data.midurlinfo.length === 0) {
            invoke('log_info', { message: '[QQMusicService] No midurlinfo in response' });
            return [];
        }

        // Find the first URL info that actually has a purl
        const validInfo = data.req_1.data.midurlinfo.find(info => !!info.purl);

        if (!validInfo) {
            invoke('log_info', { message: `[QQMusicService] All purls are empty! Song might be VIP-only with no free streams. Responses: ${JSON.stringify(data.req_1.data.midurlinfo)}` });
            return [];
        }

        invoke('log_info', { message: `[QQMusicService] Successfully found playable URL: ${validInfo.filename}` });

        const sips = data.req_1.data.sip || [
            "http://ws.stream.qqmusic.qq.com/",
            "http://dl.stream.qqmusic.qq.com/"
        ];

        return sips.map(sip => `${sip}${validInfo.purl}`);
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

    /**
     * Get song lyrics (2025 format via cgi-bin)
     * Response is jsonp mapped by _get wrapper. Contains base64 encoded lyric.
     */
    async getLyric(songmid: string, cookie: string = ''): Promise<{ lyric: string; trans: string }> {
        const url = `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=${songmid}&format=json&nobase64=0`;
        const data = await this._get<any>(url, cookie);

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
    }
};
