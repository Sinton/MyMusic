import { useMemo } from 'react';
import { unifiedSongs, playlists, albums } from '../data/mockData';
import type { Song, Playlist, Album } from '../types';

// ================== useSongs ==================
export const useSongs = () => {
    // In the future, this could be replaced with API call using React Query
    const songs = useMemo(() => unifiedSongs, []);

    return {
        songs,
        isLoading: false,
        error: null,
    };
};

// ================== usePlaylists ==================
export const usePlaylists = () => {
    const data = useMemo(() => playlists, []);

    return {
        playlists: data,
        isLoading: false,
        error: null,
    };
};

// ================== useAlbums ==================
export const useAlbums = () => {
    const data = useMemo(() => albums, []);

    return {
        albums: data,
        isLoading: false,
        error: null,
    };
};

// ================== useSongById ==================
export const useSongById = (id: number): Song | undefined => {
    return useMemo(() => unifiedSongs.find((song) => song.id === id), [id]);
};

// ================== usePlaylistById ==================
export const usePlaylistById = (id: number): Playlist | undefined => {
    return useMemo(() => playlists.find((pl) => pl.id === id), [id]);
};

// ================== useAlbumById ==================
export const useAlbumById = (id: number): Album | undefined => {
    return useMemo(() => albums.find((album) => album.id === id), [id]);
};
