import { useCallback } from 'react';
import type { Song, AudioSource } from '../types';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { songToTrack } from '../lib/trackUtils';

/**
 * Custom hook to encapsulate song-related actions
 * Reduces component complexity by centralizing song interaction logic
 */
export const useSongActions = (song: Song) => {
    const { userPlaylists, addSongToPlaylist, likedSongs, toggleLike } = usePlaylistStore();
    const { play, setTrack } = usePlayerStore();

    const isLiked = likedSongs.some(s => s.id === song.id);

    const handleLike = useCallback(() => {
        toggleLike(song);
    }, [song, toggleLike]);

    const handleAddToPlaylist = useCallback((playlistId: number) => {
        addSongToPlaylist(playlistId, song);
    }, [song, addSongToPlaylist]);

    const handlePlaySource = useCallback((source: AudioSource) => {
        const track = songToTrack(song, source);
        setTrack(track);
        play();
    }, [song, setTrack, play]);

    const handlePlayDefault = useCallback(() => {
        if (song.sources.length > 0) {
            handlePlaySource(song.sources[0]);
        }
    }, [song, handlePlaySource]);

    const isInPlaylist = useCallback((playlistId: number): boolean => {
        const playlist = userPlaylists.find(pl => pl.id === playlistId);
        return playlist?.songs?.some(s => s.id === song.id) ?? false;
    }, [song, userPlaylists]);

    return {
        isLiked,
        userPlaylists,
        handleLike,
        handleAddToPlaylist,
        handlePlaySource,
        handlePlayDefault,
        isInPlaylist
    };
};
