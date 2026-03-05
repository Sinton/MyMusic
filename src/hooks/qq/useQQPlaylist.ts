import { useQuery } from '@tanstack/react-query';
import { QQService } from '../../services/QQService';
import { useQQStore } from '../../stores/useQQStore';
import { qqToPlaylist } from './converters';
import { QQ_KEYS } from './queryKeys';

/** User's playlists (Library) */
export function useQQUserPlaylists(options = { enabled: true }) {
    const { cookie } = useQQStore();

    const query = useQuery({
        queryKey: QQ_KEYS.userPlaylists(cookie),
        queryFn: async () => {
            const res = await QQService.getUserPlaylists(cookie);
            console.log('[useQQUserPlaylists] res:', res);
            const list = (res as any).req?.data?.v_diss || (res as any).data?.v_diss || (res as any).data?.list || [];
            return list.map(qqToPlaylist);
        },
        enabled: options.enabled && !!cookie,
        retry: 2,
    });

    return {
        ...query,
        playlists: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
}
