import { MusicTrack, MusicPlaylist, MusicArtistDetail, MusicAlbumDetail } from '../types/gateway';
import { Song, Playlist, AudioSource, Artist, Album } from '../types';

export function musicTrackToSong(track: MusicTrack): Song {
    // Convert artists array to comma-separated string for Song artist field
    const artistName = track.artists.map(a => a.name).join(', ');

    // Format duration from seconds to MM:SS
    const mins = Math.floor(track.duration / 60);
    const secs = Math.floor(track.duration % 60);
    const durationStr = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return {
        songId: track.songId,
        songMid: track.songMid,
        title: track.title,
        platform: track.platform as any,
        cover: track.coverUrl,
        artist: artistName,
        artistId: track.artists[0]?.id,
        album: track.album?.name || '',
        albumId: track.album?.id,
        duration: durationStr,
        sources: [
            {
                platform: track.platform as any,
                quality: 'Standard',
                qualityLabel: '标准',
                vip: track.vip || false,
                color: track.platform === 'netease' ? '#ea4335' : track.platform === 'qq' ? '#1db954' : '#ffea00',
                songId: track.songId,
                songMid: track.songMid,
            } as AudioSource
        ],
        bestSource: track.platform,
    };
}

export function musicPlaylistToLegacy(playlist: MusicPlaylist): Playlist {
    return {
        id: playlist.id,
        platform: playlist.platform as any,
        title: playlist.name,
        cover: playlist.coverUrl,
        count: playlist.trackCount || 0,
        songCount: playlist.trackCount || 0,
        creator: playlist.creator || 'Unknown',
    };
}

export function musicArtistDetailToArtist(detail: MusicArtistDetail): Artist {
    const popularSongs = detail.popularSongs?.map(musicTrackToSong) || [];
    const albums = detail.albums?.map(a => ({
        id: a.id,
        title: a.name,
        platform: detail.platform as any,
        cover: a.coverUrl,
        artist: detail.name,
        year: 0,
    } as Album)) || [];

    return {
        id: detail.id,
        name: detail.name,
        platform: detail.platform as any,
        avatar: detail.avatarUrl || '',
        bio: detail.description,
        songCount: detail.trackCount,
        albumCount: detail.albumCount,
        popularSongs,
        albums,
    };
}

export function musicAlbumDetailToAlbum(detail: MusicAlbumDetail): Album {
    const songs = detail.tracks?.map(musicTrackToSong) || [];

    return {
        id: detail.id,
        title: detail.name,
        platform: detail.platform as any,
        cover: detail.coverUrl,
        artist: detail.artistName,
        artistId: '', // Usually not directly available in album detail without nested parsing
        year: detail.releaseDate ? parseInt(detail.releaseDate.substring(0, 4)) : 0,
        releaseDate: detail.releaseDate,
        songs,
        count: detail.trackCount || songs.length,
    };
}
