export interface UnifiedArtist {
    id: string;
    name: string;
}

export interface UnifiedAlbum {
    id: string;
    name: string;
    coverUrl?: string;
}

export interface UnifiedTrack {
    id: string;
    platform: string; // 'netease' | 'qq' | 'qishui'
    title: string;
    artists: UnifiedArtist[];
    album?: UnifiedAlbum;
    duration: number; // seconds
    coverUrl?: string;
    rawUrl?: string;
}

export interface UnifiedSearchBatch {
    platform: string;
    tracks: UnifiedTrack[];
    total: number;
    has_more: boolean;
}

export interface UnifiedPlaylist {
    id: string;
    platform: string;
    name: string;
    description?: string;
    coverUrl?: string;
    trackCount?: number;
    creator?: string;
}

export interface UnifiedArtistDetail {
    id: string;
    platform: string;
    name: string;
    avatarUrl?: string;
    description?: string;
    trackCount?: number;
    albumCount?: number;
    popularSongs: UnifiedTrack[];
    albums: UnifiedAlbum[];
}

export interface UnifiedAlbumDetail {
    id: string;
    platform: string;
    name: string;
    artistName: string;
    coverUrl?: string;
    description?: string;
    releaseDate?: string;
    trackCount?: number;
    tracks: UnifiedTrack[];
}

export type UnifiedResponse =
    | { type: 'Track', data: UnifiedTrack }
    | { type: 'Tracks', data: UnifiedTrack[] }
    | { type: 'SearchBatch', data: UnifiedSearchBatch }
    | { type: 'Playlist', data: UnifiedPlaylist }
    | { type: 'ArtistDetail', data: UnifiedArtistDetail }
    | { type: 'AlbumDetail', data: UnifiedAlbumDetail }
    | { type: 'Raw', data: any };
