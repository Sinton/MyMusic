import { create } from 'zustand';
import type { Playlist, Song, PlaylistStore } from '../types';
import { unifiedSongs } from '../data/mockData';

export const usePlaylistStore = create<PlaylistStore>((set) => ({
    // ================== STATE ==================
    userPlaylists: [
        {
            id: 100,
            title: 'My Favorites',
            count: 4,
            creator: 'Yan',
            cover: 'bg-rose-500',
            songs: [...unifiedSongs]
        },
        {
            id: 101,
            title: 'Chill Vibe',
            count: 2,
            creator: 'Yan',
            cover: 'bg-indigo-500',
            songs: [unifiedSongs[0], unifiedSongs[3]]
        },
    ],
    likedSongs: [unifiedSongs[0]],

    // ================== ACTIONS ==================
    createPlaylist: (title: string) => set((state) => {
        const newPlaylist: Playlist = {
            id: Date.now(),
            title,
            count: 0,
            creator: 'Yan',
            cover: `bg-gradient-to-br from-indigo-500 to-purple-600`,
            songs: []
        };
        return { userPlaylists: [...state.userPlaylists, newPlaylist] };
    }),

    addSongToPlaylist: (playlistId: number, song: Song) => set((state) => ({
        userPlaylists: state.userPlaylists.map(pl => {
            if (pl.id === playlistId) {
                const songs = pl.songs || [];
                const alreadyExists = songs.some(s => s.id === song.id);
                if (alreadyExists) return pl;
                const newSongs = [...songs, song];
                return { ...pl, songs: newSongs, count: newSongs.length };
            }
            return pl;
        })
    })),

    removeSongFromPlaylist: (playlistId: number, songId: number) => set((state) => ({
        userPlaylists: state.userPlaylists.map(pl => {
            if (pl.id === playlistId) {
                const songs = pl.songs || [];
                const newSongs = songs.filter(s => s.id !== songId);
                return { ...pl, songs: newSongs, count: newSongs.length };
            }
            return pl;
        })
    })),

    removePlaylist: (id: number) => set((state) => ({
        userPlaylists: state.userPlaylists.filter(pl => pl.id !== id)
    })),

    toggleLike: (song: Song) => set((state) => {
        const isLiked = state.likedSongs.some(s => s.id === song.id);
        if (isLiked) {
            return { likedSongs: state.likedSongs.filter(s => s.id !== song.id) };
        } else {
            return { likedSongs: [...state.likedSongs, song] };
        }
    }),
}));
