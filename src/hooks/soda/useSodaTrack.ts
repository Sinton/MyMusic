import { useQuery } from '@tanstack/react-query';
import { QishuiService } from '../../services/QishuiService';
import { sodaToSong } from './converters';
import { SODA_KEYS } from './queryKeys';
import type { Song } from '../../types';

/**
 * Hook to fetch track detail from Soda (Qishui)
 */
export const useSodaTrackDetail = (trackId: string, options?: { enabled?: boolean }) => {
    const query = useQuery({
        queryKey: SODA_KEYS.trackDetail(trackId),
        queryFn: async () => {
            if (!trackId) return null;
            const data = await QishuiService.getTrackDetail(trackId);
            if (!data?.data) return null;

            // Note: Qishui API returns track details differently than Netease/QQ.
            // We use the converter to normalize it to the Song type.
            return sodaToSong(data.data, data.data.artists?.[0]?.name || 'Unknown', data.data.artists?.[0]?.artistId || '');
        },
        enabled: !!trackId && options?.enabled !== false,
        staleTime: 3600_000, // 1 hour
    });

    return {
        ...query,
        track: query.data as Song | null,
    };
};
