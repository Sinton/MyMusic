import { useQuery } from '@tanstack/react-query';
import { QishuiService } from '../../services/QishuiService';
import { SODA_KEYS } from './queryKeys';
import { sodaToAlbumDetail } from './converters';
import type { Album } from '../../types';

export function useSodaAlbumDetail(albumId: string, options: { enabled?: boolean } = {}) {
    const { data: qishuiAlbum, isLoading, error } = useQuery({
        queryKey: SODA_KEYS.albumDetail(albumId),
        queryFn: () => QishuiService.getAlbumDetail(albumId),
        enabled: options.enabled,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    const album: Album | null = qishuiAlbum ? sodaToAlbumDetail(qishuiAlbum) : null;

    return { album, isLoading, error };
}
