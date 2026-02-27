import { useQuery } from '@tanstack/react-query';
import { QQMusicService } from '../services/QQMusicService';
import { useQQStore } from '../stores/useQQStore';
import type { Song, AudioSource } from '../types';
import type { QQSongItem } from '../types/api/qqmusic';

// ================== TYPE CONVERTERS ==================

/** Convert a QQ Music song item (2025.9 API format) to our app's Song type */
function qqToSong(item: QQSongItem): Song {
    const artistName = item.singer?.map((s) => s.name).join(', ') || 'Unknown Artist';
    const albumName = item.album?.name || 'Unknown Album';
    const durationMs = (item.interval || 0) * 1000;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    const source: AudioSource = {
        platform: 'QQ Music',
        quality: 'hq',
        qualityLabel: 'HQ',
        vip: item.pay?.pay_play === 1,
        color: '#31c27c',
        sourceId: item.mid,
    };

    // Construct album cover URL from album mid
    let coverUrl = undefined;
    if (item.album?.mid) {
        coverUrl = `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.album.mid}.jpg`;
    }

    return {
        id: item.mid,
        title: item.name || item.title,
        artist: artistName,
        artistId: item.singer?.[0]?.mid,
        album: albumName,
        albumId: item.album?.mid,
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        sources: [source],
        bestSource: 'QQ Music',
        genre: undefined,
        cover: coverUrl,
    };
}

// ================== QUERY KEYS ==================

export const QQQueryKeys = {
    Search: (keywords: string) => ['qq', 'search', keywords] as const,
};

// ================== HOOKS ==================

/**
 * Search QQ Music (2025.9 API)
 */
export const useQQSearch = (keywords: string, options?: { enabled?: boolean }) => {
    const cookie = useQQStore((s) => s.cookie);

    const isEnabled = (options?.enabled !== false) && !!keywords;

    const query = useQuery({
        queryKey: QQQueryKeys.Search(keywords),
        queryFn: async () => {
            console.log('[QQSearch] Fetching QQ Music results for:', keywords);
            try {
                const data = await QQMusicService.searchMusic(keywords, cookie);
                console.log('[QQSearch] Raw response code:', data?.code, 'req code:', data?.req?.code);
                const songs = data?.req?.data?.body?.song?.list || [];
                console.log('[QQSearch] Parsed songs count:', songs.length);
                if (songs.length > 0) {
                    console.log('[QQSearch] First song:', songs[0].name, '-', songs[0].singer?.[0]?.name);
                }
                return songs.map(qqToSong);
            } catch (err) {
                console.error('[QQSearch] Error:', err);
                throw err;
            }
        },
        enabled: isEnabled,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });

    return {
        ...query,
        songs: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get song lyrics from QQ Music
 */
export const useQQLyric = (songmid: string, options?: { enabled?: boolean }) => {
    const cookie = useQQStore((s) => s.cookie);

    const query = useQuery({
        queryKey: ['qq', 'lyric', songmid],
        queryFn: async () => {
            if (!songmid) return [];
            const data = await QQMusicService.getLyric(songmid, cookie);
            const lrcText = data?.lyric || '';
            // Parse LRC format: [mm:ss.xx]text
            return parseLrc(lrcText);
        },
        enabled: (options?.enabled !== false) && !!songmid,
        staleTime: Infinity, // Lyrics don't change
    });

    return {
        ...query,
        lyrics: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

// ================== HELPERS ==================

/** Parse LRC format lyrics into { time, text } array */
function parseLrc(lrc: string): { time: number; text: string }[] {
    if (!lrc) return [];

    // QQ Music sometimes escapes newlines as literal \n strings or &#10;
    const normalizedLrc = lrc.replace(/&#10;/g, '\n').replace(/\\n/g, '\n');
    const lines = normalizedLrc.split('\n');

    const result: { time: number; text: string }[] = [];

    for (const line of lines) {
        // QQ Music format matches [mm:ss.xx] or [00:00.00]
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const ms = parseInt(match[3], 10);
            const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100);
            const text = match[4].trim();
            if (text) {
                result.push({ time, text });
            }
        }
    }

    return result.sort((a, b) => a.time - b.time);
}
