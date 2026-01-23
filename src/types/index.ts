// =====================================================
// CORE DOMAIN TYPES - Business Entities
// =====================================================

// ================== PLATFORM ==================
export interface Platform {
    name: string;
    connected: boolean;
    vip: boolean;
    color: string;
}

// ================== AUDIO SOURCE ==================
export interface AudioSource {
    platform: string;
    quality: string;
    qualityLabel: string;
    vip: boolean;
    color: string;
}

// ================== SONG ==================
export interface Song {
    id: number;
    title: string;
    artist: string;
    album: string;
    duration: string;
    sources: AudioSource[];
    bestSource: string;
    genre?: string;
}

// ================== PLAYLIST ==================
export interface Playlist {
    id: number;
    title: string;
    count: number;
    creator: string;
    cover: string;
    songs?: Song[];
}

// ================== ALBUM ==================
export interface Album {
    id: number;
    title: string;
    artist: string;
    year: string;
    cover: string;
}

// ================== TRACK (Currently Playing) ==================
export interface Track {
    id: number;
    title: string;
    artist: string;
    album: string;
    duration: string;
    currentTime: string;
    source: string;
    quality: string;
}

// ================== HOME CARD ==================
export interface HomeCard {
    title: string;
    description: string;
    color: string;
}

// ================== COMMENT ==================
export interface Comment {
    id: number;
    user: string;
    avatar: string;
    content: string;
    time: string;
    likes: number;
}

// ================== LYRIC LINE ==================
export interface LyricLine {
    time: number;
    text: string;
}

// =====================================================
// DATA FETCHING TYPES
// =====================================================

export interface LoadingState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}

// =====================================================
// STORE STATE TYPES - Separated by Domain
// =====================================================

// --- Player Domain State ---
export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
    // Core Playback State
    currentTrack: Track;
    isPlaying: boolean;
    volume: number;
    repeat: RepeatMode;
    shuffle: boolean;
    currentTimeSec: number;
    durationSec: number;
    queue: Track[];
}

export interface PlayerActions {
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    setTrack: (track: Track) => void;
    setVolume: (volume: number) => void;
    toggleShuffle: () => void;
    cycleRepeat: () => void;
    toggleMode: () => void;
    nextTrack: () => void;
    previousTrack: () => void;
    setProgress: (time: number) => void;
}

export type PlayerStore = PlayerState & PlayerActions;

// --- Playlist Domain State ---
export interface PlaylistState {
    userPlaylists: Playlist[];
    likedSongs: Song[];
}

export interface PlaylistActions {
    createPlaylist: (title: string) => void;
    addSongToPlaylist: (playlistId: number, song: Song) => void;
    removeSongFromPlaylist: (playlistId: number, songId: number) => void;
    removePlaylist: (id: number) => void;
    toggleLike: (song: Song) => void;
}

export type PlaylistStore = PlaylistState & PlaylistActions;

// --- Platform Domain State ---
export interface PlatformState {
    platforms: Platform[];
}

export interface PlatformActions {
    connectPlatform: (platformName: string) => void;
    disconnectPlatform: (platformName: string) => void;
    disconnectAll: () => void;
}

export type PlatformStore = PlatformState & PlatformActions;

// --- Settings Domain State (persisted) ---
export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'pink' | 'purple' | 'blue' | 'green' | 'orange';

export interface SettingsState {
    themeMode: ThemeMode;
    accentColor: AccentColor;
    language: string;
    launchOnLogin: boolean;
    outputDevice: string;
    streamingQuality: string;
    exclusiveMode: boolean;
}

export interface SettingsActions {
    setThemeMode: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColor) => void;
    setLanguage: (lang: string) => void;
    toggleLaunchOnLogin: () => void;
    setOutputDevice: (device: string) => void;
    setStreamingQuality: (quality: string) => void;
    toggleExclusiveMode: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

// =====================================================
// UI STATE TYPES - Transient, non-persisted
// =====================================================

export interface UIState {
    // Player UI
    visualizerEnabled: boolean;
    isFullScreenPlayerOpen: boolean;
    showQueuePanel: boolean;
    showCommentsPanel: boolean;
    showOptionsPanel: boolean;

    // Modal UI
    authModalOpen: boolean;
    authModalTarget: Platform | null;
    createPlaylistModalOpen: boolean;
}

export interface UIActions {
    // Player UI
    toggleVisualizer: () => void;
    openFullScreenPlayer: () => void;
    closeFullScreenPlayer: () => void;
    toggleQueuePanel: () => void;
    toggleCommentsPanel: () => void;
    toggleOptionsPanel: () => void;
    closeAllPanels: () => void;

    // Modal UI
    openAuthModal: (platform: Platform) => void;
    closeAuthModal: () => void;
    openCreatePlaylistModal: () => void;
    closeCreatePlaylistModal: () => void;
}

export type UIStore = UIState & UIActions;
