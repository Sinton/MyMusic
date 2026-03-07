// ================== SHARED ==================
export type RepeatMode = 'off' | 'all' | 'one';
export type MusicPlatform = 'netease' | 'qq' | 'qishui' | 'local' | 'unknown';

// ================== AUDIO SOURCE ==================
export interface AudioSource {
    platform: MusicPlatform;
    quality: string;
    qualityLabel: string;
    vip: boolean;
    color: string;
    songId: string | number;
    songMid?: string | number;
}

// ================== BASE ITEM ==================
export interface MusicItem {
    title: string;
    platform: MusicPlatform;
    cover?: string;
}

// ================== SONG ==================
export interface Song extends MusicItem {
    songId: string | number;
    songMid?: string | number;
    artist: string;
    artistId?: string | number;
    album: string;
    albumId?: string | number;
    duration: string;
    sources: AudioSource[];
    bestSource: string;
    genre?: string;
}

// ================== PLAYLIST ==================
export interface Playlist extends MusicItem {
    id: string | number;
    count: number;
    songCount?: number;
    creator: string;
    songs?: Song[];
    isSubscribed?: boolean;
    creatorId?: string | number;
}

// ================== ALBUM ==================
export interface Album extends MusicItem {
    id: string | number;
    artist: string;
    artistId?: string | number;
    year: number;
    releaseDate?: string;
    artistAvatar?: string;
    songs?: Song[];
    count?: number;
    genre?: string;
}

// ================== ARTIST ==================
export interface Artist {
    id: string | number;
    name: string;
    platform: MusicPlatform;
    avatar: string;
    bio?: string;
    genres?: string[];
    followers?: string;
    popularSongs?: Song[];
    albums?: Album[];
    songCount?: number;
    albumCount?: number;
}

// ================== TRACK (Currently Playing) ==================
export interface Track extends MusicItem {
    songId: string | number;
    songMid?: string | number;
    artist: string;
    artistId?: string | number;
    album: string;
    albumId?: string | number;
    duration: string;
    currentTime: string;
    quality: string;
    source: string;
}
