export interface MusicArtist {
    id: string;
    name: string;
}

export interface MusicAlbum {
    id: string;
    name: string;
    coverUrl?: string;
}

export interface MusicTrack {
    id: string;
    platform: string;
    title: string;
    artists: MusicArtist[];
    album?: MusicAlbum;
    duration: number; // seconds
    coverUrl?: string;
    rawUrl?: string;
    vip?: boolean;
}

export interface MusicSearchBatch {
    platform: string;
    tracks: MusicTrack[];
    total: number;
    has_more: boolean;
}

export interface MusicPlaylist {
    id: string;
    platform: string;
    name: string;
    description?: string;
    coverUrl?: string;
    trackCount?: number;
    creator?: string;
}

export interface MusicArtistDetail {
    id: string;
    platform: string;
    name: string;
    avatarUrl?: string;
    description?: string;
    trackCount?: number;
    albumCount?: number;
    popularSongs: MusicTrack[];
    albums: MusicAlbum[];
}

export interface MusicAlbumDetail {
    id: string;
    platform: string;
    name: string;
    artistName: string;
    coverUrl?: string;
    description?: string;
    releaseDate?: string;
    trackCount?: number;
    tracks: MusicTrack[];
}

export interface MusicComment {
    id: string;
    content: string;
    time: number;
    likedCount: number;
    user: {
        id: string;
        nickname: string;
        avatarUrl?: string;
    };
    replyingTo?: string;
    liked: boolean;
}

export interface MusicComments {
    platform: string;
    total: number;
    hasMore: boolean;
    comments: MusicComment[];
    hotComments?: MusicComment[];
}

export type GatewayResponse =
    | { type: 'Track', data: MusicTrack }
    | { type: 'Tracks', data: MusicTrack[] }
    | { type: 'SearchBatch', data: MusicSearchBatch }
    | { type: 'Playlist', data: MusicPlaylist }
    | { type: 'Playlists', data: MusicPlaylist[] }
    | { type: 'ArtistDetail', data: MusicArtistDetail }
    | { type: 'AlbumDetail', data: MusicAlbumDetail }
    | { type: 'Comments', data: MusicComments }
    | { type: 'Raw', data: any };
