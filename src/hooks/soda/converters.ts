import type { Artist, Album, Song } from '../../types';

export const formatDuration = (ms: number): string => {
    if (!ms) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const sodaToArtist = (qishuiArtist: any): Artist | null => {
    if (!qishuiArtist?.data) return null;
    return {
        id: qishuiArtist.data.artistId,
        name: qishuiArtist.data.name,
        platform: 'soda',
        avatar: qishuiArtist.data.avatar,
        bio: qishuiArtist.data.profile?.intro || qishuiArtist.data.profile?.content || qishuiArtist.data.profile?.brief || qishuiArtist.data.profile?.content_brief || '',
        genres: [],
        popularSongs: [],
        albums: [],
        songCount: qishuiArtist.data.countTracks,
        albumCount: qishuiArtist.data.countAlbums,
    };
};

export const sodaToSong = (item: any, artistName: string, artistId: string, customAlbumName?: string, customAlbumId?: string, customCover?: string): Song => {
    return {
        id: String(item.id),
        title: item.name,
        platform: 'soda',
        artist: artistName || 'Unknown',
        artistId,
        album: customAlbumName || item.album?.name || '',
        albumId: String(customAlbumId || item.album?.id || ''),
        duration: formatDuration(item.duration_ms),
        bestSource: 'soda',
        sources: [{
            platform: 'soda',
            quality: 'hq',
            qualityLabel: 'HQ',
            vip: false,
            color: '#00d084',
            sourceId: String(item.id)
        }],
        cover: customCover || item.cover || '',
    };
};

export const sodaToAlbumListItem = (item: any, artistName: string): Album => {
    return {
        id: String(item.id),
        title: item.name,
        platform: 'soda',
        artist: artistName || 'Unknown',
        cover: item.cover || '',
        year: new Date(item.release_date * 1000).getFullYear(),
        count: item.count_tracks || item.track_count || item.countTracks || item.trackCount || item.song_count || 0,
    };
};

export const sodaToAlbumDetail = (qishuiAlbum: any): Album | null => {
    if (!qishuiAlbum?.data) return null;
    const artistName = qishuiAlbum.data.artists?.[0]?.name || 'Unknown';
    const albumName = qishuiAlbum.data.name;
    const albumId = String(qishuiAlbum.data.albumId);
    const cover = qishuiAlbum.data.cover;

    return {
        id: albumId,
        title: albumName,
        platform: 'soda',
        artist: artistName,
        cover: cover,
        year: qishuiAlbum.data.releaseDate ? new Date(qishuiAlbum.data.releaseDate * 1000).getFullYear() : new Date().getFullYear(),
        count: qishuiAlbum.data.countTracks || qishuiAlbum.data.trackList?.length || 0,
        songs: qishuiAlbum.data.trackList?.map((item: any) => sodaToSong(item, artistName, '', albumName, albumId, cover)) || [],
    };
};
