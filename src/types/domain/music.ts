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
