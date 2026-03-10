import { NeteaseService } from './NeteaseService';
import { QQService } from './QQService';
import type { LocalTrack } from '../stores/useLocalMusicStore';

export interface MatchResult {
    title: string;
    artist: string;
    album: string;
    cover: string;
    platform: 'netease' | 'qq';
    songId: string | number;
}

export const SmartMatchService = {
    /**
     * Clean up keywords for better search results
     */
    _cleanKeywords(title: string, artist: string): string {
        // Remove common noise
        let cleanTitle = title.replace(/\.(mp3|flac|wav|m4a|ogg)$/i, '')
            .replace(/\((128|320|kbps|hq|sq|hi-res)\)/gi, '')
            .replace(/\[(128|320|kbps|hq|sq|hi-res)\]/gi, '')
            .trim();

        return `${cleanTitle} ${artist === 'Unknown Artist' ? '' : artist}`.trim();
    },

    /**
     * Try to find a match on NetEase or QQ
     */
    async findMatch(track: LocalTrack): Promise<MatchResult | null> {
        const keywords = this._cleanKeywords(track.title, track.artist);

        try {
            // Priority 1: NetEase Search
            const neteaseResp = await NeteaseService.search(keywords, '', 1, 1);
            if (neteaseResp.result?.songs && neteaseResp.result.songs.length > 0) {
                const song = neteaseResp.result.songs[0];
                return {
                    title: song.name,
                    artist: song.ar?.map((a: any) => a.name).join(', ') || song.artists?.map((a: any) => a.name).join(', '),
                    album: song.al?.name || song.album?.name || '',
                    cover: song.al?.picUrl || song.album?.artist?.img1v1Url || '',
                    platform: 'netease',
                    songId: song.id
                };
            }

            // Priority 2: QQ Search
            const qqResp = await QQService.search(keywords, 1, 1);
            if (qqResp.data?.song?.list && qqResp.data.song.list.length > 0) {
                const song = qqResp.data.song.list[0];
                return {
                    title: song.songname,
                    artist: song.singer?.map((s: any) => s.name).join(', '),
                    album: song.albumname,
                    cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.albummid}.jpg`,
                    platform: 'qq',
                    songId: song.songmid
                };
            }
        } catch (error) {
            console.error('[SmartMatchService] Match failed:', error);
        }

        return null;
    }
};
