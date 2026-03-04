import { useState, useCallback } from 'react';
import { getPlatformAdapter } from '../lib/platform';
import type { Track, Song, MusicPlatform } from '../types';

interface UseTrackActionsOptions {
    onNavigate?: (view: string) => void;
    onClose?: () => void;
}

/**
 * Centralises track-level actions that were previously inlined
 * across OptionsPanel and other components.
 */
export function useTrackActions(
    currentTrack: Track | null,
    { onNavigate, onClose }: UseTrackActionsOptions = {}
) {
    const [isCopied, setIsCopied] = useState(false);

    /** Navigate to the current track's artist page via platform adapter */
    const handleViewArtist = useCallback(() => {
        if (!currentTrack || !onNavigate) return;
        const adapter = getPlatformAdapter(currentTrack.platform);
        onNavigate(adapter.getArtistPath(currentTrack.artistId || '', currentTrack.artist));
        onClose?.();
    }, [currentTrack, onNavigate, onClose]);

    /** Navigate to the current track's album page via platform adapter */
    const handleViewAlbum = useCallback(() => {
        if (!currentTrack || !onNavigate) return;
        if (currentTrack.albumId) {
            const adapter = getPlatformAdapter(currentTrack.platform);
            onNavigate(adapter.getAlbumPath(currentTrack.albumId));
        } else {
            onNavigate('Library');
        }
        onClose?.();
    }, [currentTrack, onNavigate, onClose]);

    /** Copy a share link to clipboard */
    const handleShare = useCallback(() => {
        if (!currentTrack) return;
        navigator.clipboard.writeText(`https://music.app/track/${currentTrack.id}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [currentTrack]);

    /** Create a Song object from the current Track (for playlist operations) */
    const trackToSong = useCallback((): Song | null => {
        if (!currentTrack) return null;
        return {
            id: currentTrack.id,
            title: currentTrack.title,
            platform: currentTrack.platform as MusicPlatform,
            artist: currentTrack.artist,
            artistId: currentTrack.artistId,
            album: currentTrack.album,
            albumId: currentTrack.albumId,
            duration: currentTrack.duration,
            sources: [],
            bestSource: currentTrack.source,
        };
    }, [currentTrack]);

    return {
        handleViewArtist,
        handleViewAlbum,
        handleShare,
        trackToSong,
        isCopied,
    };
}
