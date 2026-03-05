import { useQuery } from '@tanstack/react-query';
import { NeteaseService } from '../../services/NeteaseService';
import { useNeteaseStore } from '../../stores/useNeteaseStore';
import { neteaseToSong, neteaseToAlbum } from './converters';
import { NeteaseQueryKeys } from './queryKeys';
import type { Song, Album, NeteaseSongItem } from '../../types';

/**
 * Get newest albums
 */
export const useNeteaseNewestAlbums = (options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.AlbumNewest,
        queryFn: async () => {
            const data = await NeteaseService.getAlbumNewest(cookie);
            const albums = data?.albums || [];
            return albums.map(neteaseToAlbum);
        },
        enabled: options?.enabled !== false,
        staleTime: 300_000,
        retry: 2,
    });

    return {
        ...query,
        albums: (query.data || []) as Album[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get album detail with songs from NetEase
 */
export const useNeteaseAlbumDetail = (id: number, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.AlbumDetail(id),
        queryFn: async () => {
            const data = await NeteaseService.getAlbumDetail(id, cookie);
            const albumInfo = data?.album;
            if (!albumInfo) return null;

            const album: Album = {
                id: albumInfo.id,
                title: albumInfo.name,
                platform: 'netease',
                artist: albumInfo.artist?.name || albumInfo.artists?.[0]?.name || '',
                artistId: albumInfo.artist?.id || albumInfo.artists?.[0]?.id,
                year: albumInfo.publishTime ? new Date(albumInfo.publishTime).getFullYear() : new Date().getFullYear(),
                cover: albumInfo.picUrl || albumInfo.blurPicUrl || '',
                artistAvatar: albumInfo.artist?.picUrl || albumInfo.artists?.[0]?.picUrl || '',
            };

            const albumCover = albumInfo.picUrl || albumInfo.blurPicUrl || '';
            const songs = (data?.songs || []).map((s: NeteaseSongItem) => {
                const song = neteaseToSong(s);
                // Album API often omits per-song cover; fall back to album cover
                if (!song.cover) {
                    song.cover = albumCover;
                }
                return song;
            });
            return { ...album, songs };
        },
        enabled: (options?.enabled !== false) && !!id,
        staleTime: 120_000,
        retry: 2,
    });

    return {
        ...query,
        album: query.data as (Album & { songs: Song[] }) | null,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};
