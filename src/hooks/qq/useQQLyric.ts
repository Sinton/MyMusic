import { useQuery } from '@tanstack/react-query';
import { QQMusicService } from '../../services/QQMusicService';
import { useQQStore } from '../../stores/useQQStore';
import { parseLrc } from '../../lib/lrcParser';
import { QQ_KEYS } from './queryKeys';

/** Get lyrics for a QQ Music song */
export function useQQLyric(songmid: string, options = { enabled: true }) {
    const { cookie } = useQQStore();

    const { data, isLoading, error } = useQuery({
        queryKey: QQ_KEYS.lyric(songmid),
        queryFn: async () => {
            const raw = await QQMusicService.getLyric(songmid, cookie);
            const parsed = parseLrc(raw.lyric);
            return {
                lyrics: parsed,
                trans: raw.trans // Translation is usually not LRC? depends
            };
        },
        enabled: options.enabled && !!songmid && songmid !== 'undefined',
        staleTime: 24 * 60 * 60 * 1000,
        retry: 1,
    });

    return {
        lyrics: data?.lyrics || [],
        trans: data?.trans || '',
        isLoading,
        error,
    };
}
