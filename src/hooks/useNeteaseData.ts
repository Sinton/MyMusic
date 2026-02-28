import { useQuery } from '@tanstack/react-query';
import { NeteaseService } from '../services/NeteaseService';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import type { Song, Playlist, Track, AudioSource, Album, NeteaseSongItem, NeteasePlaylistItem, NeteaseAlbumFull } from '../types';

// ================== TYPE CONVERTERS ==================

/** Convert a NetEase song object to our app's Song type */
function neteaseToSong(item: NeteaseSongItem): Song {
    const artists = item.ar || item.artists || [];
    const album = item.al || item.album || {} as { name?: string; id?: number; picUrl?: string; blurPicUrl?: string };
    const artistName = artists.map(a => a.name).join(', ');
    const durationMs = item.dt || item.duration || 0;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    const source: AudioSource = {
        platform: 'NetEase Cloud',
        quality: (item.privilege?.maxbr ?? 0) >= 999000 ? 'lossless' : 'hq',
        qualityLabel: (item.privilege?.maxbr ?? 0) >= 999000 ? 'SQ' : 'HQ',
        vip: item.fee === 1,
        color: '#e60026',
    };

    return {
        id: item.id,
        title: item.name,
        artist: artistName,
        artistId: artists[0]?.id,
        album: album.name || '',
        albumId: album.id,
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        sources: [source],
        bestSource: 'NetEase Cloud',
        genre: undefined,
        // NetEase usually has picUrl or blurPicUrl on the album object
        cover: album.picUrl || album.blurPicUrl || undefined,
    };
}

/** Convert a NetEase song to our app's Track type (for player) */
function neteaseToTrack(item: NeteaseSongItem): Track {
    const artists = item.ar || item.artists || [];
    const album = item.al || item.album || {} as { name?: string; id?: number; picUrl?: string; blurPicUrl?: string };
    const artistName = artists.map(a => a.name).join(', ');
    const durationMs = item.dt || item.duration || 0;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    return {
        id: item.id,
        title: item.name,
        artist: artistName,
        artistId: artists[0]?.id,
        album: album.name || '',
        albumId: album.id,
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        currentTime: '0:00',
        source: 'NetEase Cloud',
        quality: (item.privilege?.maxbr ?? 0) >= 999000 ? 'SQ' : 'HQ',
        cover: album.picUrl || album.blurPicUrl || undefined,
    };
}

/** Convert a NetEase playlist to our app's Playlist type */
function neteaseToPlaylist(item: NeteasePlaylistItem): Playlist {
    return {
        id: item.id,
        title: item.name,
        count: item.trackCount || 0,
        creator: item.nickname || item.creator?.nickname || '',
        cover: item.coverImgUrl || item.picUrl || '',
        source: 'netease',
        isSubscribed: !!item.subscribed,
        creatorId: item.creator?.userId,
    };
}

/** Convert a NetEase album to our app's Album type */
function neteaseToAlbum(item: NeteaseAlbumFull): Album {
    return {
        id: item.id,
        title: item.name,
        artist: item.artist?.name || item.artists?.[0]?.name || '',
        artistId: item.artist?.id || item.artists?.[0]?.id,
        year: item.publishTime ? new Date(item.publishTime).getFullYear() : new Date().getFullYear(),
        cover: item.picUrl || item.blurPicUrl || '',
        count: item.size || 0,
    };
}

// ================== QUERY KEYS ==================

export const NeteaseQueryKeys = {
    Search: (keywords: string) => ['netease', 'search', keywords] as const,
    UserPlaylists: (uid: string | number) => ['netease', 'userPlaylists', uid] as const,
    PlaylistDetail: (id: string | number) => ['netease', 'playlistDetail', id] as const,
    SongDetail: (id: string | number) => ['netease', 'songDetail', id] as const,
    SongUrl: (id: string | number) => ['netease', 'songUrl', id] as const,
    Lyric: (id: string | number) => ['netease', 'lyric', id] as const,
    Personalized: ['netease', 'personalized'] as const,
    RecommendSongs: ['netease', 'recommendSongs'] as const,
    RecommendResource: ['netease', 'recommendResource'] as const,
    AlbumNewest: ['netease', 'albumNewest'] as const,
    AlbumDetail: (id: string | number) => ['netease', 'albumDetail', id] as const,
    Toplist: ['netease', 'toplist'] as const,
};

// ================== HOOKS ==================

/**
 * Search NetEase Cloud Music
 */
export const useNeteaseSearch = (keywords: string, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.Search(keywords),
        queryFn: async () => {
            const data = await NeteaseService.search(keywords, cookie);
            const songs = data?.result?.songs || [];
            return songs.map(neteaseToSong);
        },
        enabled: (options?.enabled !== false) && !!keywords,
        staleTime: 60_000,
    });

    return {
        ...query,
        songs: (query.data || []) as Song[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get user's playlists from NetEase
 */
export const useNeteaseUserPlaylists = (uid: number, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.UserPlaylists(uid),
        queryFn: async () => {
            const data = await NeteaseService.getUserPlaylists(uid, cookie);
            const playlists = data?.playlist || [];
            return playlists.map(neteaseToPlaylist);
        },
        enabled: (options?.enabled !== false) && !!uid,
        staleTime: 60_000,
    });

    return {
        ...query,
        playlists: (query.data || []) as Playlist[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get playlist detail with track list from NetEase
 */
export const useNeteasePlaylistDetail = (id: number, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.PlaylistDetail(id),
        queryFn: async () => {
            const data = await NeteaseService.getPlaylistDetail(id, cookie);
            const playlist = data?.playlist;
            if (!playlist) return null;

            const converted = neteaseToPlaylist(playlist);
            const tracks = (playlist.tracks || []).map(neteaseToSong);
            return { ...converted, songs: tracks };
        },
        enabled: (options?.enabled !== false) && !!id,
        staleTime: 1000 * 60 * 15, // 15 minutes (data is considered fresh)
        gcTime: 1000 * 60 * 60,    // 1 hour (keep in cache for 1 hour before garbage collection)
    });

    return {
        ...query,
        playlist: query.data as (Playlist & { songs: Song[] }) | null,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get personalized playlists (no login required)
 */
export const useNeteasePersonalized = (options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.Personalized,
        queryFn: async () => {
            const data = await NeteaseService.getPersonalized(cookie);
            const result = data?.result || [];
            return result.map(neteaseToPlaylist);
        },
        enabled: options?.enabled !== false,
        staleTime: 300_000, // 5 min cache
    });

    return {
        ...query,
        playlists: (query.data || []) as Playlist[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

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
                artist: albumInfo.artist?.name || albumInfo.artists?.[0]?.name || '',
                artistId: albumInfo.artist?.id || albumInfo.artists?.[0]?.id,
                year: albumInfo.publishTime ? new Date(albumInfo.publishTime).getFullYear() : new Date().getFullYear(),
                cover: albumInfo.picUrl || albumInfo.blurPicUrl || '',
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
    });

    return {
        ...query,
        album: query.data as (Album & { songs: Song[] }) | null,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get toplists (charts)
 */
export const useNeteaseToplist = (options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.Toplist,
        queryFn: async () => {
            const data = await NeteaseService.getToplist(cookie);
            const list = data?.list || [];
            return list.map(neteaseToPlaylist);
        },
        enabled: options?.enabled !== false,
        staleTime: 300_000,
    });

    return {
        ...query,
        playlists: (query.data || []) as Playlist[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get recommended songs (requires login)
 */
export const useNeteaseRecommendSongs = (options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);
    const isLoggedIn = useNeteaseStore((s) => s.isLoggedIn);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.RecommendSongs,
        queryFn: async () => {
            const data = await NeteaseService.getRecommendSongs(cookie);
            const songs = data?.data?.dailySongs || data?.recommend || [];
            return songs.map(neteaseToSong);
        },
        enabled: (options?.enabled !== false) && isLoggedIn,
        staleTime: 300_000,
    });

    return {
        ...query,
        songs: (query.data || []) as Song[],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get song playback URL
 */
export const useNeteaseSongUrl = (id: number, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.SongUrl(id),
        queryFn: async () => {
            const data = await NeteaseService.getSongUrl(id, cookie);
            const urlData = data?.data?.[0] || {} as { url: string | null };
            return urlData.url as string | null;
        },
        enabled: (options?.enabled !== false) && !!id,
        staleTime: 600_000, // 10 min cache (URLs expire)
    });

    return {
        ...query,
        songUrl: query.data || null,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

/**
 * Get song lyrics
 */
export const useNeteaseLyric = (id: string | number, options?: { enabled?: boolean }) => {
    const cookie = useNeteaseStore((s) => s.cookie);

    const query = useQuery({
        queryKey: NeteaseQueryKeys.Lyric(id),
        queryFn: async () => {
            const data = await NeteaseService.getLyric(id as number, cookie);
            const lrcText = data?.lrc?.lyric || '';
            // Parse LRC format: [mm:ss.xx]text
            return parseLrc(lrcText);
        },
        enabled: (options?.enabled !== false) && !!id,
        staleTime: Infinity, // Lyrics don't change
    });

    return {
        ...query,
        lyrics: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

// ================== HELPERS ==================

/** Parse LRC format lyrics into { time, text } array */
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

/** Export converters for use elsewhere */
export { neteaseToSong, neteaseToTrack, neteaseToPlaylist, neteaseToAlbum };
