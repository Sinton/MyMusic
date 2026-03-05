import { useQuery } from '@tanstack/react-query';
import { QQService } from '../../services/QQService';
import { useQQStore } from '../../stores/useQQStore';
import { qqToSong } from './converters';
import { QQ_KEYS } from './queryKeys';

/** Global search for QQ Music */
export function useQQSearch(query_str: string, options = { enabled: true }) {
    const { cookie } = useQQStore();

    const query = useQuery({
        queryKey: QQ_KEYS.search(query_str),
        queryFn: async () => {
            const res = await QQService.searchMusic(query_str, cookie);
            const data = res as any;
            const node = data.req?.data || data.req_0?.data || data.pc_search?.data || data.search?.data || data.query?.data || data.data || data;

            if ((data.req?.code || data.req_0?.code || data.pc_search?.code || data.search?.code || 0) !== 0) {
                console.warn('[useQQSearch] API returned error code:', data.req?.code || data.req_0?.code || data.pc_search?.code || data.search?.code);
            }

            const songList = node?.body?.song?.list || node?.song?.list || node?.list || [];
            return songList.map(qqToSong);
        },
        enabled: options.enabled && !!query_str,
        retry: 2,
    });

    return {
        ...query,
        songs: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
}
