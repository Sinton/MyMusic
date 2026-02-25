import type { Song, Track, AudioSource } from '../types';

/**
 * Convert a Song (with sources) into a Track (for the player).
 *
 * If a specific AudioSource is provided, its platform and quality are used.
 * Otherwise the song's bestSource and first source quality are used as defaults.
 *
 * @param song      The Song domain object
 * @param source    Optional specific AudioSource that was selected
 * @param overrides Optional partial Track fields (e.g. cover fallback from playlist)
 */
export function songToTrack(
    song: Song,
    source?: AudioSource,
    overrides?: Partial<Pick<Track, 'cover'>>
): Track {
    return {
        id: song.id,
        title: song.title,
        artist: song.artist,
        artistId: song.artistId,
        album: song.album,
        albumId: song.albumId,
        duration: song.duration,
        currentTime: '0:00',
        source: source?.platform || song.bestSource,
        quality: source?.qualityLabel || song.sources[0]?.qualityLabel || 'Standard',
        cover: overrides?.cover || song.cover,
    };
}
