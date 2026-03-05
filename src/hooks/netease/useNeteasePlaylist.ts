import { useQuery } from '@tanstack/react-query';
import { NeteaseService } from '../../services/NeteaseService';
import { useNeteaseStore } from '../../stores/useNeteaseStore';
import { neteaseToSong, neteaseToPlaylist } from './converters';
import { NeteaseQueryKeys } from './queryKeys';
import type { Song, Playlist } from '../../types';

/**
 * Get user's playlists from NetEase
 */
export const useNeteaseUserPlaylists = (uid: number, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.UserPlaylists(uid),
        queryFn: async () => {
            const data = await NeteaseService.getUserPlaylists(uid, cookie);
            const playlists = data?.playlist || [];
            return playlists.map(neteaseToPlaylist);
        },
        enabled: (options?.enabled !== false) && !!uid,
        staleTime: 60_000,
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
 * Get playlist detail with track list from NetEase
 */
export const useNeteasePlaylistDetail = (id: number, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.PlaylistDetail(id),
        queryFn: async () => {
            const data = await NeteaseService.getPlaylistDetail(id, cookie);
            const playlist = data?.playlist;
            if (!playlist) return null;

            const converted = neteaseToPlaylist(playlist);
            const tracks = (playlist.tracks || []).map(neteaseToSong);
            return { ...converted, songs: tracks };
        },
        enabled: (options?.enabled !== false) && !!id,
        staleTime: 1000 * 60 * 15,
        gcTime: 1000 * 60 * 60,
        retry: 2,
    });

    return {
        ...query,
        playlist: query.data as (Playlist & { songs: Song[] }) | null,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};
