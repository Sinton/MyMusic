import { useQuery } from '@tanstack/react-query';
import { useMusicApiGateway } from './useMusicApiGateway';
import { MusicArtistDetail, MusicAlbumDetail } from '../types/gateway';

export function useMusicArtistDetail(platform: string, artistId: string | number, options: { enabled?: boolean } = { enabled: true }) {
    const { request } = useMusicApiGateway();

    return useQuery({
        queryKey: ['artist-detail', platform, artistId],
        queryFn: async () => {
            const res = await request(platform, 'artist_detail', { id: artistId });
            if (res?.type === 'ArtistDetail') {
                return res.data as MusicArtistDetail;
            }
            if (res?.type === 'Raw') {
                // Fallback for non-unified implementations if any
                return res.data as any;
            }
            throw new Error('Failed to fetch music artist detail');
        },
        enabled: (options.enabled ?? true) && !!artistId && !!platform,
    });
}

export function useMusicAlbumDetail(platform: string, albumId: string | number, options: { enabled?: boolean } = { enabled: true }) {
    const { request } = useMusicApiGateway();

    return useQuery({
        queryKey: ['album-detail', platform, albumId],
        queryFn: async () => {
            const res = await request(platform, 'album_detail', { id: albumId });
            if (res?.type === 'AlbumDetail') {
                return res.data as MusicAlbumDetail;
            }
            if (res?.type === 'Raw') {
                return res.data as any;
            }
            throw new Error('Failed to fetch music album detail');
        },
        enabled: (options.enabled ?? true) && !!albumId && !!platform,
    });
}
