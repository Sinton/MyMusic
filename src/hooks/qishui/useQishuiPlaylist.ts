import { useQuery } from '@tanstack/react-query';
import { QishuiService } from '../../services/QishuiService';
import { qishuiToSong } from './converters';
import { QISHUI_KEYS } from './queryKeys';
import type { Playlist } from '../../types';

/**
 * Hook to fetch playlist detail from qishui (qishui).
 * In qishui, this often means resolving a share link that contains multiple tracks 
 * or a single track being treated as a "playlist" of one.
 */
export const useQishuiPlaylistDetail = (id: string, options?: { enabled?: boolean }) => {
    const query = useQuery({
        // We use the same 'all' qishui key but split by playlist type
        queryKey: [...QISHUI_KEYS.all, 'playlist', 'detail', id],
        queryFn: async () => {
            if (!id) return null;

            // If the ID is a URL, resolve it. 
            // If it's a numeric ID, we might need a different API (if available), 
            // but for now we follow the 'resolve' pattern.
            const data = await QishuiService.getTrackDetail(id);
            if (!data?.data) return null;

            const song = qishuiToSong(
                data.data,
                data.data.artist || 'Unknown',
                data.data.artistId || ''
            );

            const playlist: Playlist = {
                id: `qishui:${id}`,
                title: song.title,
                platform: 'qishui',
                cover: song.cover,
                creator: song.artist,
                count: 1,
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
