import { useQuery } from '@tanstack/react-query';
import { QishuiService } from '../../services/QishuiService';
import { sodaToSong } from './converters';
import { SODA_KEYS } from './queryKeys';
import type { Song } from '../../types';

/**
 * Hook to search for Soda (Qishui) tracks.
 * Note: Currently Qishui backend doesn't support generic keyword search.
 * This hook primarily handles link resolution if the keyword is a URL.
 */
export const useSodaSearch = (keywords: string, options?: { enabled?: boolean }) => {
    const isLink = QishuiService.isQishuiLink(keywords);

    const query = useQuery({
        queryKey: SODA_KEYS.search(keywords),
        queryFn: async () => {
            if (!keywords || !isLink) return [];

            try {
                const data = await QishuiService.resolveShareLink(keywords);
                if (data?.data) {
                    const song = sodaToSong(
                        data.data,
                        data.data.artists?.[0]?.name || 'Unknown',
                        data.data.artists?.[0]?.artistId || ''
                    );
                    return [song];
                }
            } catch (err) {
                console.error('[useSodaSearch] Failed to resolve link:', err);
            }
            return [];
        },
        enabled: (options?.enabled !== false) && !!keywords && isLink,
        staleTime: 300_000,
    });

    return {
        ...query,
        songs: (query.data || []) as Song[],
    };
};
