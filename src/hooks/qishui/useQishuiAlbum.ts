import { useQuery } from '@tanstack/react-query';
import { QishuiService } from '../../services/QishuiService';
import { QISHUI_KEYS } from './queryKeys';
import { qishuiToAlbumDetail } from './converters';
import type { Album } from '../../types';

export function useQishuiAlbumDetail(albumId: string, options: { enabled?: boolean } = {}) {
    const { data: qishuiAlbum, isLoading, error } = useQuery({
        queryKey: QISHUI_KEYS.albumDetail(albumId),
        queryFn: () => QishuiService.getAlbumDetail(albumId),
        enabled: options.enabled,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    const album: Album | null = qishuiAlbum ? qishuiToAlbumDetail(qishuiAlbum) : null;

    return { album, isLoading, error };
}
