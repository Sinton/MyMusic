import { useQuery } from '@tanstack/react-query';
import { QishuiService } from '../services/QishuiService';
import type { Artist, Album, Song } from '../types';

const formatDuration = (ms: number): string => {
    if (!ms) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export function useQishuiArtistDetail(artistId: string, options: { enabled?: boolean } = {}) {
    const { data: qishuiArtist, isLoading, error } = useQuery({
        queryKey: ['qishui-artist-detail', artistId],
        queryFn: () => QishuiService.getArtistDetail(artistId),
        enabled: options.enabled,
        staleTime: 5 * 60 * 1000,
    });

    const artist: Artist | null = qishuiArtist?.data ? {
        id: qishuiArtist.data.artistId,
        name: qishuiArtist.data.name,
        avatar: qishuiArtist.data.avatar,
        // Try intro, content, brief, or other possible fields for bio
        bio: qishuiArtist.data.profile?.intro || qishuiArtist.data.profile?.content || qishuiArtist.data.profile?.brief || qishuiArtist.data.profile?.content_brief || '',
        genres: [],
        popularSongs: [],
        albums: [],
        songCount: qishuiArtist.data.countTracks,
        albumCount: qishuiArtist.data.countAlbums,
    } : null;

    return { artist, isLoading, error };
}

export function useQishuiArtistSongs(artistId: string, options: { enabled?: boolean } = {}) {
    const { data: qishuiArtist, isLoading, error } = useQuery({
        queryKey: ['qishui-artist-detail', artistId],
        queryFn: () => QishuiService.getArtistDetail(artistId),
        enabled: options.enabled,
        staleTime: 5 * 60 * 1000,
    });

    const songs: Song[] = qishuiArtist?.data?.trackList?.map(item => {
        return {
            id: String(item.id),
            title: item.name,
            artist: qishuiArtist.data.name,
            artistId,
            album: item.album?.name || '',
            albumId: String(item.album?.id || ''),
            duration: formatDuration(item.duration_ms),
            bestSource: 'soda',
            sources: [{
                platform: '汽水音乐',
                quality: 'hq',
                qualityLabel: 'HQ',
                vip: false,
                color: '#00d084',
                sourceId: String(item.id)
            }],
            source: 'soda',
            cover: item.cover || '', // Use pre-computed cover from backend
        };
    }) || [];

    return { songs, isLoading, error };
}

export function useQishuiArtistAlbums(artistId: string, options: { enabled?: boolean } = {}) {
    const { data: qishuiArtist, isLoading, error } = useQuery({
        queryKey: ['qishui-artist-detail', artistId],
        queryFn: () => QishuiService.getArtistDetail(artistId),
        enabled: options.enabled,
        staleTime: 5 * 60 * 1000,
    });

    const albums: Album[] = qishuiArtist?.data?.albumList?.map(item => {
        return {
            id: String(item.id),
            title: item.name,
            artist: qishuiArtist.data.name,
            cover: item.cover || '', // Use pre-computed cover from backend
            year: new Date(item.release_date * 1000).getFullYear(),
            count: item.count_tracks || item.track_count || item.countTracks || item.trackCount || item.song_count || 0,
            source: 'soda',
        };
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

export function useQishuiAlbumDetail(albumId: string, options: { enabled?: boolean } = {}) {
    const { data: qishuiAlbum, isLoading, error } = useQuery({
        queryKey: ['qishui-album-detail', albumId],
        queryFn: () => QishuiService.getAlbumDetail(albumId),
        enabled: options.enabled,
        staleTime: 5 * 60 * 1000,
    });

    const album: Album | null = qishuiAlbum?.data ? {
        id: String(qishuiAlbum.data.albumId),
        title: qishuiAlbum.data.name,
        artist: qishuiAlbum.data.artists?.[0]?.name || 'Unknown',
        cover: qishuiAlbum.data.cover,
        year: qishuiAlbum.data.releaseDate ? new Date(qishuiAlbum.data.releaseDate * 1000).getFullYear() : new Date().getFullYear(),
        count: qishuiAlbum.data.countTracks || qishuiAlbum.data.trackList?.length || 0,
        songs: qishuiAlbum.data.trackList.map(item => ({
            id: String(item.id),
            title: item.name,
            artist: qishuiAlbum.data.artists?.[0]?.name || 'Unknown',
            album: qishuiAlbum.data.name,
            albumId: String(qishuiAlbum.data.albumId),
            duration: formatDuration(item.duration_ms),
            bestSource: 'soda',
            sources: [{
                platform: '汽水音乐',
                quality: 'hq',
                qualityLabel: 'HQ',
                vip: false,
                color: '#00d084',
                sourceId: String(item.id)
            }],
            cover: qishuiAlbum.data.cover,
        }) as Song),
        source: 'soda',
    } : null;

    return { album, isLoading, error };
}
