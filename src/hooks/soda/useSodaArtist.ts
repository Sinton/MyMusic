import { useQuery } from '@tanstack/react-query';
import { QishuiService } from '../../services/QishuiService';
import { SODA_KEYS } from './queryKeys';
import { sodaToArtist, sodaToSong, sodaToAlbumListItem } from './converters';
import type { Artist, Song, Album } from '../../types';

export function useSodaArtistDetail(artistId: string, options: { enabled?: boolean } = {}) {
    const { data: qishuiArtist, isLoading, error } = useQuery({
        queryKey: SODA_KEYS.artistDetail(artistId),
        queryFn: () => QishuiService.getArtistDetail(artistId),
        enabled: options.enabled,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    const artist: Artist | null = qishuiArtist ? sodaToArtist(qishuiArtist) : null;

    return { artist, isLoading, error };
}

export function useSodaArtistSongs(artistId: string, options: { enabled?: boolean } = {}) {
    const { data: qishuiArtist, isLoading, error } = useQuery({
        queryKey: SODA_KEYS.artistDetail(artistId), // React query deduplicates identical calls
        queryFn: () => QishuiService.getArtistDetail(artistId),
        enabled: options.enabled,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    const songs: Song[] = qishuiArtist?.data?.trackList?.map((item: any) => {
        return sodaToSong(item, qishuiArtist.data.name, artistId);
    }) || [];

    return { songs, isLoading, error };
}

export function useSodaArtistAlbums(artistId: string, options: { enabled?: boolean } = {}) {
    // Note: Actually relies on the same getArtistDetail response for albums
    const { data: qishuiArtist, isLoading, error } = useQuery({
        queryKey: SODA_KEYS.artistDetail(artistId),
        queryFn: () => QishuiService.getArtistDetail(artistId),
        enabled: options.enabled,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    const albums: Album[] = qishuiArtist?.data?.albumList?.map((item: any) => {
        return sodaToAlbumListItem(item, qishuiArtist.data.name);
    }) || [];

    return {
        albums,
        isLoading,
        error,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: () => { },
    };
}
