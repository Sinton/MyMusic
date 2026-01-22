import { useMemo, useState, useEffect } from 'react';
import { unifiedSongs, playlists, albums } from '../data/mockData';
import type { Song, Playlist, Album, LoadingState } from '../types';

/**
 * Simulates async data fetching with loading states
 * In production, replace with actual API calls using React Query or SWR
 */
const simulateFetch = <T,>(data: T, delay = 0): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(data), delay);
    });
};

// ================== useSongs ==================
export const useSongs = (): LoadingState<Song[]> & { songs: Song[] } => {
    const [state, setState] = useState<LoadingState<Song[]>>({
        data: unifiedSongs, // Use sync data for immediate display
        isLoading: false,
        error: null,
    });

    // In production, this would be an actual API call
    // useEffect(() => {
    //     setState(prev => ({ ...prev, isLoading: true }));
    //     simulateFetch(unifiedSongs, 500)
    //         .then(data => setState({ data, isLoading: false, error: null }))
    //         .catch(err => setState({ data: null, isLoading: false, error: err.message }));
    // }, []);

    return {
        ...state,
        songs: state.data || [],
    };
};

// ================== usePlaylists ==================
export const usePlaylists = (): LoadingState<Playlist[]> & { playlists: Playlist[] } => {
    const [state, setState] = useState<LoadingState<Playlist[]>>({
        data: playlists,
        isLoading: false,
        error: null,
    });

    return {
        ...state,
        playlists: state.data || [],
    };
};

// ================== useAlbums ==================
export const useAlbums = (): LoadingState<Album[]> & { albums: Album[] } => {
    const [state, setState] = useState<LoadingState<Album[]>>({
        data: albums,
        isLoading: false,
        error: null,
    });

    return {
        ...state,
        albums: state.data || [],
    };
};

// ================== useSongById ==================
export const useSongById = (id: number): LoadingState<Song> & { song: Song | undefined } => {
    const song = useMemo(() => unifiedSongs.find((s) => s.id === id), [id]);

    return {
        data: song || null,
        isLoading: false,
        error: song ? null : `Song with id ${id} not found`,
        song,
    };
};

// ================== usePlaylistById ==================
export const usePlaylistById = (id: number): LoadingState<Playlist> & { playlist: Playlist | undefined } => {
    const playlist = useMemo(() => playlists.find((pl) => pl.id === id), [id]);

    return {
        data: playlist || null,
        isLoading: false,
        error: playlist ? null : `Playlist with id ${id} not found`,
        playlist,
    };
};

// ================== useAlbumById ==================
export const useAlbumById = (id: number): LoadingState<Album> & { album: Album | undefined } => {
    const album = useMemo(() => albums.find((a) => a.id === id), [id]);

    return {
        data: album || null,
        isLoading: false,
        error: album ? null : `Album with id ${id} not found`,
        album,
    };
};

// ================== useAsyncData (Generic) ==================
/**
 * Generic hook for async data fetching with loading states
 * Use this pattern when integrating with real APIs
 */
export const useAsyncData = <T,>(
    fetchFn: () => Promise<T>,
    dependencies: unknown[] = []
): LoadingState<T> => {
    const [state, setState] = useState<LoadingState<T>>({
        data: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        fetchFn()
            .then(data => {
                if (!cancelled) {
                    setState({ data, isLoading: false, error: null });
                }
            })
            .catch(err => {
                if (!cancelled) {
                    setState({ data: null, isLoading: false, error: err.message || 'An error occurred' });
                }
            });

        return () => {
            cancelled = true;
        };
    }, dependencies);

    return state;
};
