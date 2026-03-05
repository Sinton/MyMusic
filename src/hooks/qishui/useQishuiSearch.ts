import { useQuery } from '@tanstack/react-query';
import { QishuiService } from '../../services/QishuiService';
import { qishuiToSong } from './converters';
import { QISHUI_KEYS } from './queryKeys';
import type { Song } from '../../types';

/**
 * Hook to search for qishui (qishui) tracks.
 * Note: Currently qishui backend doesn't support generic keyword search.
 * This hook primarily handles link resolution if the keyword is a URL.
 */
export const useQishuiSearch = (keywords: string, options?: { enabled?: boolean }) => {
    const isLink = QishuiService.isQishuiLink(keywords);

    const query = useQuery({
        queryKey: QISHUI_KEYS.search(keywords),
        queryFn: async () => {
            if (!keywords || !isLink) return [];

            try {
                const data = await QishuiService.resolveShareLink(keywords);
                if (data?.data) {
                    const song = qishuiToSong(
                        data.data,
                        data.data.artist || 'Unknown',
                        data.data.artistId || ''
                    );
                    return [song];
                }
            } catch (err) {
                console.error('[useQishuiSearch] Failed to resolve link:', err);
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
