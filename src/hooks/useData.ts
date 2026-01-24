import { useQuery } from '@tanstack/react-query';
import { MusicService } from '../services/MusicService';


// ================== QUERY KEYS ==================
export const QueryKeys = {
    Songs: ['songs'] as const,
    SongsByArtist: (artist: string) => ['songs', 'artist', artist] as const,
    SongsByAlbum: (albumId: number) => ['songs', 'album', albumId] as const,
    Song: (id: number) => ['song', id] as const,
    Playlists: ['playlists'] as const,
    Playlist: (id: number) => ['playlist', id] as const,
    Albums: ['albums'] as const,
    AlbumsByArtist: (artist: string) => ['albums', 'artist', artist] as const,
    Album: (id: number) => ['album', id] as const,
    Lyrics: (id: number) => ['lyrics', id] as const,
    Comments: (id: number) => ['comments', id] as const,
};

// ================== HOOKS ==================

export const useSongs = () => {
    const query = useQuery({
        queryKey: QueryKeys.Songs,
        queryFn: MusicService.getSongs,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        ...query,
        songs: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

export const usePlaylists = () => {
    const query = useQuery({
        queryKey: QueryKeys.Playlists,
        queryFn: MusicService.getPlaylists,
        staleTime: 1000 * 60 * 5,
    });

    return {
        ...query,
        playlists: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

export const useAlbums = () => {
    const query = useQuery({
        queryKey: QueryKeys.Albums,
        queryFn: MusicService.getAlbums,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    return {
        ...query,
        albums: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

export const useSongById = (id: number) => {
    const query = useQuery({
        queryKey: QueryKeys.Song(id),
        queryFn: () => MusicService.getSongById(id),
        enabled: !!id,
    });

    return {
        ...query,
        song: query.data,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

export const usePlaylistById = (id: number) => {
    const query = useQuery({
        queryKey: QueryKeys.Playlist(id),
        queryFn: () => MusicService.getPlaylistById(id),
        enabled: !!id,
    });

    return {
        ...query,
        playlist: query.data,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

export const useAlbumById = (id: number) => {
    const query = useQuery({
        queryKey: QueryKeys.Album(id),
        queryFn: () => MusicService.getAlbumById(id),
        enabled: !!id,
    });

    return {
        ...query,
        album: query.data,
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

export const useSongsByArtist = (artistName: string) => {
    const query = useQuery({
        queryKey: QueryKeys.SongsByArtist(artistName),
        queryFn: () => MusicService.getSongsByArtist(artistName),
        enabled: !!artistName,
    });

    return {
        ...query,
        songs: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

export const useAlbumsByArtist = (artistName: string) => {
    const query = useQuery({
        queryKey: QueryKeys.AlbumsByArtist(artistName),
        queryFn: () => MusicService.getAlbumsByArtist(artistName),
        enabled: !!artistName,
    });

    return {
        ...query,
        albums: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

export const useSongsByAlbumId = (albumId: number) => {
    const query = useQuery({
        queryKey: QueryKeys.SongsByAlbum(albumId),
        queryFn: () => MusicService.getSongsByAlbumId(albumId),
        enabled: !!albumId,
    });

    return {
        ...query,
        songs: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};

export const useLyrics = (songId: number) => {
    const query = useQuery({
        queryKey: QueryKeys.Lyrics(songId),
        queryFn: () => MusicService.getLyrics(songId),
        enabled: !!songId,
    });

    return {
        ...query,
        lyrics: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
    };
};
