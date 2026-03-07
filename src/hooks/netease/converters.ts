import type { Song, Playlist, Track, AudioSource, Album, Artist, NeteaseSongItem, NeteasePlaylistItem, NeteaseAlbumFull } from '../../types';

/** Convert a NetEase song object to our app's Song type */
export function neteaseToSong(item: NeteaseSongItem): Song {
    const artists = item.ar || item.artists || [];
    const album = item.al || item.album || {} as any;
    const artistName = artists.map(a => a.name).join(', ');
    const durationMs = item.dt || item.duration || 0;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    const source: AudioSource = {
        platform: 'netease',
        quality: (item.privilege?.maxbr ?? 0) >= 999000 ? 'lossless' : 'hq',
        qualityLabel: (item.privilege?.maxbr ?? 0) >= 999000 ? 'SQ' : 'HQ',
        vip: item.fee === 1,
        color: '#e60026',
        songId: item.id,
        songMid: item.id,
    };

    // NetEase cover detection - fallback to item.picUrl if album metadata is incomplete
    const cover = album.picUrl || album.blurPicUrl || item.picUrl;

    return {
        songId: item.id,
        songMid: item.id,
        title: item.name,
        platform: 'netease',
        artist: artistName,
        artistId: artists[0]?.id,
        album: album.name || '',
        albumId: album.id,
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        sources: [source],
        bestSource: 'netease',
        genre: undefined,
        cover: cover || undefined,
    };
}

/** Convert a NetEase song to our app's Track type (for player) */
export function neteaseToTrack(item: NeteaseSongItem): Track {
    const artists = item.ar || item.artists || [];
    const album = item.al || item.album || {} as any;
    const artistName = artists.map(a => a.name).join(', ');
    const durationMs = item.dt || item.duration || 0;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    const cover = album.picUrl || album.blurPicUrl || item.picUrl;

    return {
        songId: item.id,
        songMid: item.id,
        title: item.name,
        platform: 'netease',
        artist: artistName,
        artistId: artists[0]?.id,
        album: album.name || '',
        albumId: album.id,
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        currentTime: '0:00',
        source: 'netease',
        quality: (item.privilege?.maxbr ?? 0) >= 999000 ? 'SQ' : 'HQ',
        cover: cover || undefined,
    };
}

/** Convert a NetEase playlist to our app's Playlist type */
export function neteaseToPlaylist(item: NeteasePlaylistItem): Playlist {
    return {
        id: item.id,
        title: item.name,
        platform: 'netease',
        count: item.trackCount || 0,
        creator: item.nickname || item.creator?.nickname || '',
        cover: item.coverImgUrl || item.picUrl || '',
        isSubscribed: !!item.subscribed,
        creatorId: item.creator?.userId,
    };
}

/** Convert a NetEase album to our app's Album type */
export function neteaseToAlbum(item: NeteaseAlbumFull): Album {
    return {
        id: item.id,
        title: item.name,
        platform: 'netease',
        artist: item.artist?.name || item.artists?.[0]?.name || '',
        artistId: item.artist?.id || item.artists?.[0]?.id,
        year: item.publishTime ? new Date(item.publishTime).getFullYear() : new Date().getFullYear(),
        cover: item.picUrl || item.blurPicUrl || '',
        count: item.size || 0,
    };
}

/** Convert NetEase artist */
export function neteaseToArtist(artist: any, identify?: any): Artist {
    return {
        id: artist.id,
        name: artist.name,
        platform: 'netease',
        avatar: artist.picUrl || artist.cover || identify?.imageTag || '',
        bio: artist.briefDesc || '',
        songCount: artist.musicSize || 0,
        albumCount: artist.albumSize || 0,
    };
}
