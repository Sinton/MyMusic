import { UnifiedTrack, UnifiedPlaylist, UnifiedArtistDetail, UnifiedAlbumDetail } from '../types/unified';
import { Song, Playlist, AudioSource, Artist, Album } from '../types';

export function unifiedTrackToSong(track: UnifiedTrack): Song {
    // Convert artists array to comma-separated string for Song artist field
    const artistName = track.artists.map(a => a.name).join(', ');

    // Format duration from seconds to MM:SS
    const mins = Math.floor(track.duration / 60);
    const secs = Math.floor(track.duration % 60);
    const durationStr = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return {
        id: track.id,
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
                vip: false,
                color: track.platform === 'netease' ? '#ea4335' : track.platform === 'qq' ? '#1db954' : '#ffea00',
                sourceId: track.id,
            } as AudioSource
        ],
        bestSource: track.platform,
    };
}

export function unifiedPlaylistToLegacy(playlist: UnifiedPlaylist): Playlist {
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

export function unifiedArtistDetailToArtist(detail: UnifiedArtistDetail): Artist {
    const popularSongs = detail.popularSongs?.map(unifiedTrackToSong) || [];
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
        songCount: detail.track_count,
        albumCount: detail.album_count,
        popularSongs,
        albums,
    };
}

export function unifiedAlbumDetailToAlbum(detail: UnifiedAlbumDetail): Album {
    const songs = detail.tracks?.map(unifiedTrackToSong) || [];

    return {
        id: detail.id,
        title: detail.name,
        platform: detail.platform as any,
        cover: detail.coverUrl,
        artist: detail.artist_name,
        artistId: '', // Usually not directly available in album detail without nested parsing
        year: detail.releaseDate ? parseInt(detail.releaseDate.substring(0, 4)) : 0,
        releaseDate: detail.releaseDate,
        songs,
        count: detail.track_count || songs.length,
    };
}
