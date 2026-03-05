import { useQuery } from '@tanstack/react-query';
import { QishuiService } from '../../services/QishuiService';
import { qishuiToSong } from './converters';
import { QISHUI_KEYS } from './queryKeys';
import type { Song } from '../../types';

/**
 * Hook to fetch track detail from qishui (qishui)
 */
export const useQishuiTrackDetail = (trackId: string, options?: { enabled?: boolean }) => {
    const query = useQuery({
        queryKey: QISHUI_KEYS.trackDetail(trackId),
        queryFn: async () => {
            if (!trackId) return null;
            const data = await QishuiService.getTrackDetail(trackId);
            if (!data?.data) return null;

            // Note: qishui API returns track details differently than Netease/QQ.
            // We use the converter to normalize it to the Song type.
            return qishuiToSong(data.data, data.data.artist || 'Unknown', data.data.artistId || '');
        },
        enabled: !!trackId && options?.enabled !== false,
        staleTime: 3600_000, // 1 hour
    });

    return {
        ...query,
        track: query.data as Song | null,
    };
};
