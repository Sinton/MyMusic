import type {
    Song,
    Playlist,
    Album,
    LyricLine,
    Comment
} from '../types';
import {
    unifiedSongs,
    playlists,
    albums,
    mockLyrics,
    mockComments
} from '../data/mockData';

// Simulated delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MusicService = {
    // Songs
    getSongs: async (): Promise<Song[]> => {
        await delay(500);
        return unifiedSongs;
    },

    getSongById: async (id: number): Promise<Song | undefined> => {
        await delay(200);
        return unifiedSongs.find(s => s.id === id);
    },

    // Playlists
    getPlaylists: async (): Promise<Playlist[]> => {
        await delay(600);
        return playlists;
    },

    getPlaylistById: async (id: number): Promise<Playlist | undefined> => {
        await delay(300);
        return playlists.find(p => p.id === id);
    },

    // Albums
    getAlbums: async (): Promise<Album[]> => {
        await delay(500);
        return albums;
    },

    getAlbumById: async (id: number): Promise<Album | undefined> => {
        await delay(300);
        return albums.find(a => a.id === id);
    },

    getSongsByAlbumId: async (albumId: number): Promise<Song[]> => {
        await delay(300);
        return unifiedSongs.filter(s => s.albumId === albumId);
    },

    // Artists (Derived)
    getSongsByArtist: async (artistName: string): Promise<Song[]> => {
        await delay(400);
        return unifiedSongs.filter(s => s.artist.includes(artistName));
    },

    getAlbumsByArtist: async (artistName: string): Promise<Album[]> => {
        await delay(400);
        return albums.filter(a => a.artist === artistName);
    },

    // Lyrics
    getLyrics: async (_songId: number): Promise<LyricLine[]> => {
        await delay(100); // Fast response for lyrics
        // In a real app we would filter by songId
        return mockLyrics;
    },

    // Comments
    getComments: async (_songId: number): Promise<Comment[]> => {
        await delay(800);
        return mockComments;
    }
};
