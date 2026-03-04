// ================== SHARED ==================
export type RepeatMode = 'off' | 'all' | 'one';
export type MusicPlatform = 'netease' | 'qq' | 'soda' | 'local' | 'unknown';

export interface AudioSource {
    platform: MusicPlatform;
    quality: string;
    qualityLabel: string;
    vip: boolean;
    color: string;
    sourceId?: string | number;
}

// ================== BASE ITEM ==================
export interface MusicItem {
    id: string | number;
    title: string;
    platform: MusicPlatform;
    cover?: string;
}

// ================== SONG ==================
export interface Song extends MusicItem {
    artist: string;
    artistId?: string | number;
    album: string;
    albumId?: string | number;
    duration: string;
    sources: AudioSource[];
    bestSource: string; // Legacy field for playback
    genre?: string;
}

// ================== PLAYLIST ==================
export interface Playlist extends MusicItem {
    count: number;
    songCount?: number; // UI alias
    creator: string;
    songs?: Song[];
    isSubscribed?: boolean;
    creatorId?: string | number;
}

// ================== ALBUM ==================
export interface Album extends MusicItem {
    artist: string;
    artistId?: string | number;
    year: number;
    releaseDate?: string; // UI alias / formatted string
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
    artist: string;
    artistId?: string | number;
    album: string;
    albumId?: string | number;
    duration: string;
    currentTime: string;
    quality: string;
    sourceId?: string | number;
    // For legacy support during migration
    source: string;
}
