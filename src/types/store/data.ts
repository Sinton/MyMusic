import type { Playlist, Song } from '../domain/music';
import type { Platform } from '../domain/general';

// --- Playlist Store ---
export interface PlaylistState {
    userPlaylists: Playlist[];
    likedSongs: Song[];
}

export interface PlaylistActions {
    createPlaylist: (title: string, cover?: string) => void;
    addSongToPlaylist: (playlistId: number, song: Song) => void;
    removeSongFromPlaylist: (playlistId: number, songId: number) => void;
    removePlaylist: (id: number) => void;
    updatePlaylistTitle: (id: number, title: string) => void;
    updatePlaylistCover: (id: number, cover: string) => void;
    toggleLike: (song: Song) => void;
}

export type PlaylistStore = PlaylistState & PlaylistActions;

// --- Platform Store ---
export interface PlatformState {
    platforms: Platform[];
}

export interface PlatformActions {
    connectPlatform: (platformName: string) => void;
    disconnectPlatform: (platformName: string) => void;
    disconnectAll: () => void;
}

export type PlatformStore = PlatformState & PlatformActions;
