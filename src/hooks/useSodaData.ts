import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { QishuiService } from '../services/QishuiService';

/** Parse LRC format lyrics into { time, text } array (Helper copied from NetEase/QQ) */
function parseLrc(lrc: string): { time: number; text: string }[] {
    if (!lrc) return [];
    const lines = lrc.split('\n');
    const result: { time: number; text: string }[] = [];

    for (const line of lines) {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const ms = parseInt(match[3], 10);
            const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100);
            const text = match[4].trim();
            if (text) {
                result.push({ time, text });
            }
        }
    }

    return result.sort((a, b) => a.time - b.time);
}

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
