import { useQuery } from '@tanstack/react-query';
import { useMusicApi } from './common/useMusicApi';
import { UnifiedArtistDetail, UnifiedAlbumDetail } from '../types/unified';

export function useUnifiedArtistDetail(platform: string, artistId: string | number) {
    const { request } = useMusicApi();

    return useQuery({
        queryKey: ['artist-detail', platform, artistId],
        queryFn: async () => {
            const res = await request(platform, 'artist_detail', { id: artistId });
            if (res?.type === 'ArtistDetail') {
                return res.data as UnifiedArtistDetail;
            }
            if (res?.type === 'Raw') {
                // Fallback for non-unified implementations if any
                return res.data as any;
            }
            throw new Error('Failed to fetch unified artist detail');
        },
        enabled: !!artistId && !!platform,
    });
}

export function useUnifiedAlbumDetail(platform: string, albumId: string | number) {
    const { request } = useMusicApi();

    return useQuery({
        queryKey: ['album-detail', platform, albumId],
        queryFn: async () => {
            const res = await request(platform, 'album_detail', { id: albumId });
            if (res?.type === 'AlbumDetail') {
                return res.data as UnifiedAlbumDetail;
            }
            if (res?.type === 'Raw') {
                return res.data as any;
            }
            throw new Error('Failed to fetch unified album detail');
        },
        enabled: !!albumId && !!platform,
    });
}
