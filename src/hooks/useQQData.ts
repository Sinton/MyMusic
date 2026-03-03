import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { QQMusicService } from '../services/QQMusicService';
import { useQQStore } from '../stores/useQQStore';
import type { Song, AudioSource, Playlist, Album } from '../types';

// ================== TYPE CONVERTERS ==================

/** Convert a QQ Music song item (2025.9 API format) to our app's Song type */
/** Convert a QQ Music song item (2025.10 API format) to our app's Song type */
function qqToSong(item: any): Song {
    if (!item) return { id: 0, title: 'Unknown', artist: 'Unknown', album: 'Unknown', duration: '0:00', sources: [], bestSource: 'qq' };

    // Support both mid and id, but prefer mid for QQ Music URLs
    const songMid = item.mid || item.songmid || String(item.id || '');
    const artistName = (item.singer || item.singer_list)?.map((s: any) => s.name).join(', ') || 'Unknown Artist';
    const singers = item.singer || item.singer_list || [];
    const artistMid = singers[0]?.mid || singers[0]?.singer_mid || singers[0]?.singerMid || '';
    const albumName = item.album?.name || item.album?.title || 'Unknown Album';
    // Prefer string mid (alphanumeric) over numeric id for QQ Music API compatibility
    const albumMid = item.album?.mid || item.album?.album_mid || item.album?.pmid || '';

    const durationMs = (item.interval || 0) * 1000;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    const source: AudioSource = {
        platform: 'QQ Music',
        quality: 'hq',
        qualityLabel: 'HQ',
        vip: item.pay?.pay_play === 1 || item.pay?.pay_month === 1,
        color: '#31c27c',
        sourceId: songMid,
    };

    const songTitleBase = item.title || item.name || 'Unknown Title';
    const subtitle = item.subtitle || '';
    const songTitle = subtitle ? `${songTitleBase} (${subtitle})` : songTitleBase;

    return {
        id: songMid,
        title: songTitle,
        artist: artistName,
        artistId: artistMid,
        album: albumName,
        albumId: albumMid,
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        sources: [source],
        bestSource: 'QQ Music',
        cover: albumMid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumMid}.jpg` : undefined,
    };
}

/** Convert QQ album item to our app's Album type */
function qqToAlbum(item: any): Album {
    const mid = item.albumMid || item.album_mid || item.mid || '';
    const yearStr = item.publishDate || item.pubTime || item.publicTime || item.pub_time || '';
    let year = 0;
    if (yearStr && typeof yearStr === 'string') {
        year = parseInt(yearStr.split('-')[0]) || 0;
    } else if (typeof yearStr === 'number') {
        year = yearStr;
    } else {
        year = new Date().getFullYear();
    }

    return {
        id: mid,
        title: item.albumName || item.album_name || item.name || item.title || 'Unknown Album',
        artist: item.singerName || item.singer_name || (item.singer?.[0]?.name) || (item.singer_list?.[0]?.name) || 'Unknown Artist',
        artistId: item.singerMid || item.singer_mid || (item.singer?.[0]?.mid) || (item.singer_list?.[0]?.mid),
        year: year,
        cover: mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg` : '',
        count: item.totalNum || item.songNum || item.song_count || item.total_song || item.total || item.song_num || (item.albumType === 'Single' ? 1 : 0),
        source: 'qq'
    };
}

/** Convert QQ playlist item to our app's Playlist type */
function qqToPlaylist(item: any): Playlist {
    return {
        id: item.dissid,
        title: item.dissname,
        count: item.song_cnt || 0,
        creator: '', // Not easily available in result
        cover: item.imgurl || '',
        source: 'qq',
        isSubscribed: item.dirid !== 0, // dirid 0 usually means self created
    };
}

// ================== QUERY KEYS ==================

const QQ_KEYS = {
    search: (query: string) => ['qq', 'search', query] as const,
    userPlaylists: (uin: string) => ['qq', 'user', 'playlists', uin] as const,
    artistDetail: (mid: string) => ['qq', 'artist', 'detail', mid] as const,
    artistSongs: (mid: string, page: number) => ['qq', 'artist', 'songs', mid, page] as const,
    artistAlbums: (mid: string) => ['qq', 'artist', 'albums', mid] as const,
    albumDetail: (mid: string) => ['qq', 'album', 'detail', mid] as const,
};

// ================== HOOKS ==================

/** Global search for QQ Music */
export function useQQSearch(query: string, options = { enabled: true }) {
    const { cookie } = useQQStore();

    const { data, isLoading, error } = useQuery({
        queryKey: QQ_KEYS.search(query),
        queryFn: async () => {
            const res = await QQMusicService.searchMusic(query, cookie);
            const data = res as any;
            const node = data.req?.data || data.req_0?.data || data.pc_search?.data || data.search?.data || data.query?.data || data.data || data;

            if ((data.req?.code || data.req_0?.code || data.pc_search?.code || data.search?.code || 0) !== 0) {
                console.warn('[useQQSearch] API returned error code:', data.req?.code || data.req_0?.code || data.pc_search?.code || data.search?.code);
            }

            const songList = node?.body?.song?.list || node?.song?.list || node?.list || [];
            return songList.map(qqToSong);
        },
        enabled: options.enabled && !!query,
    });

    return {
        songs: data || [],
        isLoading,
        error,
    };
}

/** User's playlists (Library) */
export function useQQUserPlaylists(options = { enabled: true }) {
    const { cookie } = useQQStore();

    const { data, isLoading, error } = useQuery({
        queryKey: QQ_KEYS.userPlaylists(cookie),
        queryFn: async () => {
            const res = await QQMusicService.getUserPlaylists(cookie);
            console.log('[useQQUserPlaylists] res:', res);
            // playlist.UserDissListServer returns req.data.v_diss
            const list = (res as any).req?.data?.v_diss || (res as any).data?.v_diss || (res as any).data?.list || [];
            return list.map(qqToPlaylist);
        },
        enabled: options.enabled && !!cookie,
    });

    return {
        playlists: data || [],
        isLoading,
        error,
    };
}

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

            return {
                mid: mid,
                name: info.name || info.singer_name || info.SingerName || info.singerName,
                avatar: `https://y.gtimg.cn/music/photo_new/T001R300x300M000${mid}.jpg`,
                bio: bio.replace(/<br>/g, '\n').trim(),
                songCount: reqData?.total_song || info.song_count || info.songNum || info.total_song || 0,
                albumCount: reqData?.total_album || info.album_count || info.albumNum || info.total_album || 0,
            };
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
    const LIMIT = 30;

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

/** Album detail and tracklist */
export function useQQAlbumDetail(albumMid: string, options = { enabled: true }) {
    const { data, isLoading, error } = useQuery({
        queryKey: QQ_KEYS.albumDetail(albumMid),
        queryFn: async () => {
            const data = await QQMusicService.getAlbumDetail(albumMid);
            console.log('[useQQAlbumDetail] Raw:', data);

            // music.musichallAlbum.AlbumInfoServer returns req.data
            const reqData = (data as any).req?.data || (data as any).data;
            if (!reqData) throw new Error('Album not found (empty reqData)');

            const info = reqData.basicInfo || reqData.albumInfo || reqData;
            const mid = info.albumMid || info.album_mid || info.mid || albumMid;

            // Tracks can be in req_1.data.songList, reqData.songList or list
            const req1Data = (data as any).req_1?.data;
            const songsRaw = req1Data?.songList || req1Data?.song_list || req1Data?.songlist || reqData.songList || reqData.song_list || reqData.list || [];
            const songs = songsRaw.map((item: any) => qqToSong(item.songInfo || item));

            const artistMid = info.singerMid || info.singer_mid ||
                reqData.singer?.singerList?.[0]?.mid ||
                reqData.singer?.[0]?.mid ||
                (info.singer?.[0]?.mid) ||
                (info.singer?.[0]?.singer_mid);

            const album: Album = {
                id: mid,
                title: info.albumName || info.album_name || info.name || 'Unknown Album',
                artist: info.singerName || info.singer_name ||
                    reqData.singerName || reqData.singer_name ||
                    reqData.singer?.singerList?.[0]?.name ||
                    reqData.singer?.[0]?.name ||
                    (info.singer?.[0]?.name) ||
                    'Unknown Artist',
                artistId: artistMid,
                artistAvatar: artistMid ? `https://y.gtimg.cn/music/photo_new/T001R300x300M000${artistMid}.jpg` : undefined,
                cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg`,
                songs: songs,
                source: 'qq' as const,
                year: info.publishDate ? parseInt(info.publishDate.split('-')[0]) : (info.publicTime ? parseInt(info.publicTime.split('-')[0]) : (info.pub_time ? parseInt(info.pub_time.split('-')[0]) : 0)),
                count: req1Data?.totalNum || req1Data?.total || songs.length || 0,
            };

            return album;
        },
        enabled: options.enabled && !!albumMid && albumMid !== 'undefined',
    });

    return {
        album: data,
        isLoading,
        error,
    };
}

/** Get lyrics for a QQ Music song */
export function useQQLyric(songmid: string, options = { enabled: true }) {
    const { cookie } = useQQStore();

    const { data, isLoading, error } = useQuery({
        queryKey: ['qq', 'lyric', songmid],
        queryFn: async () => {
            const raw = await QQMusicService.getLyric(songmid, cookie);
            const parsed = parseLrc(raw.lyric);
            return {
                lyrics: parsed,
                trans: raw.trans // Translation is usually not LRC? depends
            };
        },
        enabled: options.enabled && !!songmid && songmid !== 'undefined',
        staleTime: 24 * 60 * 60 * 1000, // Lyrics are very stable
    });

    return {
        lyrics: data?.lyrics || [],
        trans: data?.trans || '',
        isLoading,
        error,
    };
}

/** Parse LRC format lyrics into { time, text } array (Helper copied from NetEase) */
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
