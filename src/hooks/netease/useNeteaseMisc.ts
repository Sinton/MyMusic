import { useQuery } from '@tanstack/react-query';
import { NeteaseService } from '../../services/NeteaseService';
import { useNeteaseStore } from '../../stores/useNeteaseStore';
import { parseLrc } from '../../lib/lrcParser';
import { neteaseToSong, neteaseToPlaylist } from './converters';
import { NeteaseQueryKeys } from './queryKeys';
import type { Song, Playlist } from '../../types';

/**
 * Get personalized playlists (no login required)
 */
export const useNeteasePersonalized = (options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.Personalized,
        queryFn: async () => {
            const data = await NeteaseService.getPersonalized(cookie);
            const result = data?.result || [];
            return result.map(neteaseToPlaylist);
        },
        enabled: options?.enabled !== false,
        staleTime: 300_000,
        retry: 2,
    });

    return {
        ...query,
        playlists: (query.data || []) as Playlist[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get toplists (charts)
 */
export const useNeteaseToplist = (options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.Toplist,
        queryFn: async () => {
            const data = await NeteaseService.getToplist(cookie);
            const list = data?.list || [];
            return list.map(neteaseToPlaylist);
        },
        enabled: options?.enabled !== false,
        staleTime: 300_000,
        retry: 2,
    });

    return {
        ...query,
        playlists: (query.data || []) as Playlist[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get recommended songs (requires login)
 */
export const useNeteaseRecommendSongs = (options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);
    const isLoggedIn = useNeteaseStore((s) => s.isLoggedIn);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.RecommendSongs,
        queryFn: async () => {
            const data = await NeteaseService.getRecommendSongs(cookie);
            const songs = data?.data?.dailySongs || data?.recommend || [];
            return songs.map(neteaseToSong);
        },
        enabled: (options?.enabled !== false) && isLoggedIn,
        staleTime: 300_000,
        retry: 2,
    });

    return {
        ...query,
        songs: (query.data || []) as Song[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get song playback URL
 */
export const useNeteaseSongUrl = (id: number, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.SongUrl(id),
        queryFn: async () => {
            const data = await NeteaseService.getSongUrl(id, cookie);
            const urlData = data?.data?.[0] || {} as { url: string | null };
            return urlData.url as string | null;
        },
        enabled: (options?.enabled !== false) && !!id,
        staleTime: 600_000,
        retry: 2,
    });

    return {
        ...query,
        songUrl: query.data || null,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get song lyrics
 */
export const useNeteaseLyric = (id: string | number, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.Lyric(id),
        queryFn: async () => {
            const data = await NeteaseService.getLyric(id as number, cookie);
            const lrcText = data?.lrc?.lyric || '';
            // Parse LRC format: [mm:ss.xx]text
            return parseLrc(lrcText);
        },
        enabled: (options?.enabled !== false) && !!id,
        staleTime: Infinity,
        retry: 1,
    });

    return {
        ...query,
        lyrics: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};
