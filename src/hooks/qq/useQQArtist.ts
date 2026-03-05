import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { QQMusicService } from '../../services/QQMusicService';
import { qqToSong, qqToAlbum, qqToArtist } from './converters';
import { QQ_KEYS } from './queryKeys';

/** Artist detail and bio */
export function useQQArtistDetail(artistMid: string, options = { enabled: true }) {
    const { data, isLoading, error } = useQuery({
        queryKey: QQ_KEYS.artistDetail(artistMid),
        queryFn: async () => {
            const data = await QQMusicService.getArtistDetail(artistMid);
            console.log('[useQQArtistDetail] Raw:', data);

            const reqData = (data as any).req?.data || (data as any).header?.data || (data as any).data;
            const info = reqData?.singer_info || reqData?.basic?.singer_info || reqData?.singerInfo || reqData?.basicInfo || reqData;

            if (!info || (!info.mid && !info.singer_mid && !info.SingerMid)) {
                throw new Error('Artist not found');
            }

            const mid = info.mid || info.singer_mid || info.SingerMid;
            // Bio can be in reqData directly or info
            const bio = reqData?.singer_brief || info.desc || info.singer_desc || info.singer_brief || info.brief || info.SingerDesc || '';

            return qqToArtist(mid, info, bio, reqData);
        },
        enabled: options.enabled && !!artistMid && artistMid !== 'undefined',
    });

    return {
        artist: data,
        isLoading,
        error,
    };
}

/** Artist's songs with pagination */
export function useQQArtistSongs(artistMid: string, options: { enabled?: boolean; page?: number } = { enabled: true, page: 0 }) {
    const { data, isLoading, error } = useQuery({
        queryKey: QQ_KEYS.artistSongs(artistMid, options.page || 0),
        queryFn: async () => {
            const data = await QQMusicService.getArtistSongs(artistMid, options.page);
            console.log('[useQQArtistSongs] Raw:', data);

            const reqData = (data as any).req?.data || (data as any).data;
            // GetSingerSongList returns 'songList' (camel) or 'songlist' (lower)
            const list = reqData?.songList || reqData?.songlist || reqData?.song_list || reqData?.list || [];

            return list.map((item: any) => qqToSong(item.songInfo || item));
        },
        enabled: options.enabled && !!artistMid && artistMid !== 'undefined',
    });

    return {
        songs: data || [],
        isLoading,
        error,
    };
}

/** Artist's albums with infinite scroll pagination */
export function useQQArtistAlbums(artistMid: string, options?: { enabled?: boolean }) {

    const query = useInfiniteQuery({
        queryKey: QQ_KEYS.artistAlbums(artistMid),
        queryFn: async ({ pageParam = 0 }) => {
            const data = await QQMusicService.getArtistAlbums(artistMid, pageParam);
            console.log('[useQQArtistAlbums] Raw:', data);

            const reqData = (data as any).req?.data || (data as any).data;
            const list = (reqData?.albumList || reqData?.album_list || reqData?.albumlist || reqData?.list || []).map(qqToAlbum);
            const total = reqData?.total || 0;

            return {
                albums: list,
                // Use actual returned count as offset step to never skip items
                nextBegin: list.length > 0 ? pageParam + list.length : undefined,
                total,
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextBegin,
        enabled: (options?.enabled !== false) && !!artistMid && artistMid !== 'undefined',
        staleTime: 300_000,
    });

    const allAlbums = query.data ? query.data.pages.flatMap(page => page.albums) : [];

    return {
        albums: allAlbums,
        hasNextPage: !!query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
        fetchNextPage: query.fetchNextPage,
        isLoading: query.isLoading,
        error: query.error,
    };
}
