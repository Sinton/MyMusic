import type { Playlist, Song } from '../domain/music';
import type { Platform } from '../domain/general';

// --- Playlist Store ---
export interface PlaylistState {
    userPlaylists: Playlist[];
    likedSongs: Song[];
}

export interface PlaylistActions {
    createPlaylist: (title: string, cover?: string) => void;
    addSongToPlaylist: (playlistId: string | number, song: Song) => void;
    removeSongFromPlaylist: (playlistId: string | number, songId: string | number) => void;
    removePlaylist: (id: string | number) => void;
    updatePlaylistTitle: (id: string | number, title: string) => void;
    updatePlaylistCover: (id: string | number, cover: string) => void;
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
