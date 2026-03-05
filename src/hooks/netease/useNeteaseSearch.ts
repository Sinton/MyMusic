import { useQuery } from '@tanstack/react-query';
import { NeteaseService } from '../../services/NeteaseService';
import { useNeteaseStore } from '../../stores/useNeteaseStore';
import { neteaseToSong } from './converters';
import { NeteaseQueryKeys } from './queryKeys';
import type { Song } from '../../types';

/**
 * Search NetEase Cloud Music
 */
export const useNeteaseSearch = (keywords: string, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.Search(keywords),
        queryFn: async () => {
            const data = await NeteaseService.search(keywords, cookie);
            const songs = data?.result?.songs || [];
            return songs.map(neteaseToSong);
        },
        enabled: (options?.enabled !== false) && !!keywords,
        staleTime: 60_000,
        retry: 2,
    });

    return {
        ...query,
        songs: (query.data || []) as Song[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};
