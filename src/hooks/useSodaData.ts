import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { QishuiService } from '../services/QishuiService';
import { parseLrc } from '../lib/lrcParser';

export function useSodaLyric(trackId: string, options?: Omit<UseQueryOptions<string, Error, string>, 'queryKey' | 'queryFn'>) {
    const query = useQuery({
        queryKey: ['soda_lyric', trackId],
        queryFn: async () => {
            if (!trackId) return '';
            const result = await QishuiService.getLyric(trackId);
            if (result?.data?.lrc) {
                return result.data.lrc;
            }
            throw new Error('No lyrics found');
        },
        ...options
    });

    const parsedLyrics = query.data ? parseLrc(query.data) : [];

    return { ...query, lyrics: parsedLyrics };
}
