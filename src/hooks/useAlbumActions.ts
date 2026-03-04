import { useCallback } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { Song, Track } from '../types';

/**
 * Centralises album-level playback actions
 * (play all, add to queue) previously inlined in AlbumDetailView.
 */
export function useAlbumActions() {
    const { setTrack, play, setQueue, queue } = usePlayerStore();

    /** Play all songs in the given list from the beginning */
    const playAll = useCallback((songs: Song[]) => {
        if (songs.length === 0) return;

        const tracks: Track[] = songs.map(song => ({
            id: song.id,
            title: song.title,
            platform: song.platform,
            artist: song.artist,
            artistId: song.artistId,
            album: song.album,
            albumId: song.albumId,
            duration: song.duration,
            currentTime: '0:00',
            source: song.bestSource,
            quality: song.sources[0]?.qualityLabel || 'Standard',
            cover: song.cover,
        }));

        setQueue(tracks);
        setTrack(tracks[0]);
        play();
    }, [setQueue, setTrack, play]);

    /** Add songs to the end of the current queue */
    const addAllToQueue = useCallback((songs: Song[]) => {
        const tracks: Track[] = songs.map(song => ({
            id: song.id,
            title: song.title,
            platform: song.platform,
            artist: song.artist,
            artistId: song.artistId,
            album: song.album,
            albumId: song.albumId,
            duration: song.duration,
            currentTime: '0:00',
            source: song.bestSource,
            quality: song.sources[0]?.qualityLabel || 'Standard',
            cover: song.cover,
        }));

        setQueue([...queue, ...tracks]);
    }, [setQueue, queue]);

    /** Calculate total duration string from a list of songs */
    const getTotalDuration = useCallback((songs: Song[], unitLabel: string) => {
        let totalSeconds = 0;
        songs.forEach(song => {
            const [mins, secs] = song.duration.split(':').map(Number);
            totalSeconds += (mins * 60) + (secs || 0);
        });
        return `${Math.floor(totalSeconds / 60)} ${unitLabel}`;
    }, []);

    return {
        playAll,
        addAllToQueue,
        getTotalDuration,
    };
}
