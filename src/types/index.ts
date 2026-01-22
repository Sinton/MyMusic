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
    count: string;
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

// ================== STORE TYPES ==================
export interface PlayerState {
    currentTrack: Track;
    isPlaying: boolean;
    volume: number;
    repeat: 'off' | 'all' | 'one';
    shuffle: boolean;
    currentTimeSec: number;
    durationSec: number;
    queue: Track[];
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
    visualizerEnabled: boolean;
    toggleVisualizer: () => void;
}

export interface PlatformState {
    platforms: Platform[];
    connectPlatform: (platformName: string) => void;
    disconnectPlatform: (platformName: string) => void;
    disconnectAll: () => void;
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

export interface LyricLine {
    time: number;
    text: string;
}

export interface PlatformState {
    platforms: Platform[];
    connectPlatform: (platformName: string) => void;
    disconnectPlatform: (platformName: string) => void;
    disconnectAll: () => void;
}
