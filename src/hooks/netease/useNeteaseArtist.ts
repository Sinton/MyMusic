import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { NeteaseService } from '../../services/NeteaseService';
import { useNeteaseStore } from '../../stores/useNeteaseStore';
import { neteaseToSong, neteaseToAlbum, neteaseToArtist } from './converters';
import { NeteaseQueryKeys } from './queryKeys';
import type { Song, Artist } from '../../types';

/**
 * Get artist Detail
 */
export const useNeteaseArtistDetail = (id: number | string, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.ArtistDetail(id),
        queryFn: async () => {
            const data = await NeteaseService.getArtistDetail(id, cookie);
            const artist = data?.artist || data?.data?.artist;
            if (!artist) return null;

            const identify = data?.identify || data?.data?.identify;
            return neteaseToArtist(artist, identify);
        },
        enabled: (options?.enabled !== false) && !!id,
        staleTime: 300_000,
        retry: 2,
    });

    return {
        ...query,
        artist: query.data as Artist | null,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get artist popular songs
 */
export const useNeteaseArtistSongs = (id: number | string, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);
    // Also get artist detail to use avatar as fallback cover
    const { artist } = useNeteaseArtistDetail(id, { enabled: !!id });
    const avatar = artist?.avatar;

    const query = useQuery({
        queryKey: NeteaseQueryKeys.ArtistSongs(id),
        queryFn: async () => {
            const data = await NeteaseService.getArtistSongs(id, cookie);
            const songs = data?.songs || [];
            return songs.map(s => {
                const song = neteaseToSong(s);
                if (!song.cover && avatar) {
                    song.cover = avatar;
                }
                return song;
            });
        },
        enabled: (options?.enabled !== false) && !!id,
        staleTime: 300_000,
        retry: 2,
    });

    return {
        ...query,
        songs: (query.data || []) as Song[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get artist albums (Paginated/Infinite)
 */
export const useNeteaseArtistAlbums = (id: number | string, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);
    const LIMIT = 30;

    const query = useInfiniteQuery({
        queryKey: NeteaseQueryKeys.ArtistAlbums(id),
        queryFn: async ({ pageParam = 0 }) => {
            const data = await NeteaseService.getArtistAlbums(id, cookie, LIMIT, pageParam);
            const albums = (data?.hotAlbums || []).map(neteaseToAlbum);
            return {
                albums,
                nextOffset: data.more ? pageParam + LIMIT : undefined,
                hasMore: data.more,
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        enabled: (options?.enabled !== false) && !!id,
        staleTime: 300_000,
        retry: 2,
    });

    const allAlbums = query.data ? query.data.pages.flatMap(page => page.albums) : [];

    return {
        ...query,
        albums: allAlbums,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
        fetchNextPage: query.fetchNextPage,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};
