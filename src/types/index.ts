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
    count: number; // Fixed: was string, now number for proper type
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

// ================== LOADING STATE ==================
export interface LoadingState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}

// ================== STORE TYPES ==================
export interface PlayerState {
    // State
    currentTrack: Track;
    isPlaying: boolean;
    volume: number;
    repeat: 'off' | 'all' | 'one';
    shuffle: boolean;
    currentTimeSec: number;
    durationSec: number;
    queue: Track[];
    visualizerEnabled: boolean;
    // Actions
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
    toggleVisualizer: () => void;
}

export interface PlatformState {
    platforms: Platform[];
    connectPlatform: (platformName: string) => void;
    disconnectPlatform: (platformName: string) => void;
    disconnectAll: () => void;
}

export interface PlaylistState {
    userPlaylists: Playlist[];
    likedSongs: Song[];
    createPlaylist: (title: string) => void;
    addSongToPlaylist: (playlistId: number, song: Song) => void;
    removeSongFromPlaylist: (playlistId: number, songId: number) => void;
    removePlaylist: (id: number) => void;
    toggleLike: (song: Song) => void;
}
