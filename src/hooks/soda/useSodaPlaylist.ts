import { useQuery } from '@tanstack/react-query';
import { QishuiService } from '../../services/QishuiService';
import { sodaToSong } from './converters';
import { SODA_KEYS } from './queryKeys';
import type { Playlist, Song } from '../../types';

/**
 * Hook to fetch playlist detail from Soda (Qishui).
 * In Qishui, this often means resolving a share link that contains multiple tracks 
 * or a single track being treated as a "playlist" of one.
 */
export const useSodaPlaylistDetail = (id: string, options?: { enabled?: boolean }) => {
    const query = useQuery({
        // We use the same 'all' soda key but split by playlist type
        queryKey: [...SODA_KEYS.all, 'playlist', 'detail', id],
        queryFn: async () => {
            if (!id) return null;

            // If the ID is a URL, resolve it. 
            // If it's a numeric ID, we might need a different API (if available), 
            // but for now we follow the 'resolve' pattern.
            const data = await QishuiService.getTrackDetail(id);
            if (!data?.data) return null;

            const song = sodaToSong(
                data.data,
                data.data.artists?.[0]?.name || 'Unknown',
                data.data.artists?.[0]?.artistId || ''
            );

            const playlist: Playlist = {
                id: `soda:${id}`,
                title: song.title,
                platform: 'soda',
                cover: song.cover,
                author: song.artist,
                songCount: 1,
                songs: [song]
            };

            return playlist;
        },
        enabled: !!id && options?.enabled !== false,
        staleTime: 3600_000,
    });

    return {
        ...query,
        playlist: query.data as Playlist | null,
    };
};
