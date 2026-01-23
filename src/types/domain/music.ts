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
    artistId?: number;
    album: string;
    albumId?: number;
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
    artistId?: number;
    year: string;
    cover: string;
    songs?: Song[];
    genre?: string;
}

// ================== ARTIST ==================
export interface Artist {
    id: number;
    name: string;
    avatar: string;
    bio?: string;
    genres?: string[];
    followers?: string;
    popularSongs?: Song[];
    albums?: Album[];
}

// ================== TRACK (Currently Playing) ==================
export interface Track {
    id: number;
    title: string;
    artist: string;
    artistId?: number;
    album: string;
    albumId?: number;
    duration: string;
    currentTime: string;
    source: string;
    quality: string;
}
