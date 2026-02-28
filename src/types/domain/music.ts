// ================== AUDIO SOURCE ==================
export type RepeatMode = 'off' | 'all' | 'one';

export interface AudioSource {
    platform: string;
    quality: string;
    qualityLabel: string;
    vip: boolean;
    color: string;
    sourceId?: string | number;
}

// ================== SONG ==================
export interface Song {
    id: string | number;
    title: string;
    artist: string;
    artistId?: string | number;
    album: string;
    albumId?: string | number;
    duration: string;
    sources: AudioSource[];
    bestSource: string;
    genre?: string;
    cover?: string;
}

// ================== PLAYLIST ==================
export interface Playlist {
    id: string | number;
    title: string;
    count: number;
    creator: string;
    cover: string;
    songs?: Song[];
}

// ================== ALBUM ==================
export interface Album {
    id: string | number;
    title: string;
    artist: string;
    artistId?: number;
    year: number;
    cover: string;
    songs?: Song[];
    count?: number;
    genre?: string;
}

// ================== ARTIST ==================
export interface Artist {
    id: string | number;
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
    id: string | number;
    title: string;
    artist: string;
    artistId?: string | number;
    album: string;
    albumId?: string | number;
    duration: string;
    currentTime: string;
    source: string;
    quality: string;
    cover?: string;
    sourceId?: string | number;
}
