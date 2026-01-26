import { create } from 'zustand';
import type { Playlist, Song, PlaylistStore } from '../types';
import { unifiedSongs, mockPlaylists } from '../data/mockData';

export const usePlaylistStore = create<PlaylistStore>((set) => ({
    // ================== STATE ==================
    userPlaylists: mockPlaylists,
    likedSongs: [unifiedSongs[0]],

    // ================== ACTIONS ==================
    createPlaylist: (title: string, cover?: string) => set((state) => {
        const gradients = [
            'bg-gradient-to-br from-indigo-500 to-purple-600',
            'bg-gradient-to-br from-rose-500 to-orange-500',
            'bg-gradient-to-br from-emerald-500 to-teal-500',
            'bg-gradient-to-br from-blue-500 to-cyan-500',
            'bg-gradient-to-br from-amber-500 to-yellow-500',
            'bg-gradient-to-br from-pink-500 to-rose-500',
            'bg-gradient-to-br from-fuchsia-500 to-pink-600',
            'bg-gradient-to-br from-violet-500 to-fuchsia-500'
        ];
        // Use provided cover, or pick a random one if not provided
        const selectedCover = cover || gradients[Math.floor(Math.random() * gradients.length)];

        const newPlaylist: Playlist = {
            id: Date.now(),
            title,
            count: 0,
            creator: 'Yan',
            cover: selectedCover,
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

    updatePlaylistTitle: (id: number, title: string) => set((state) => ({
        userPlaylists: state.userPlaylists.map(pl =>
            pl.id === id ? { ...pl, title } : pl
        )
    })),

    updatePlaylistCover: (id: number, cover: string) => set((state) => ({
        userPlaylists: state.userPlaylists.map(pl =>
            pl.id === id ? { ...pl, cover } : pl
        )
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
