/**
 * @deprecated — Import from 'hooks/netease' instead.
 * This file is kept as a re-export shim for backward compatibility.
 */
export {
    // Converters
    neteaseToSong,
    neteaseToTrack,
    neteaseToPlaylist,
    neteaseToAlbum,

    // Query Keys
    NeteaseQueryKeys,

    // Hooks
    useNeteaseSearch,
    useNeteaseUserPlaylists,
    useNeteasePlaylistDetail,
    useNeteasePersonalized,
    useNeteaseNewestAlbums,
    useNeteaseAlbumDetail,
    useNeteaseToplist,
    useNeteaseArtistDetail,
    useNeteaseArtistSongs,
    useNeteaseArtistAlbums,
    useNeteaseRecommendSongs,
    useNeteaseSongUrl,
    useNeteaseLyric,
} from './netease';
