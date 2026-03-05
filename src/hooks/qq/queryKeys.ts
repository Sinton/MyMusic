export const QQ_KEYS = {
    search: (query: string) => ['qq', 'search', query] as const,
    userPlaylists: (uin: string) => ['qq', 'user', 'playlists', uin] as const,
    artistDetail: (mid: string) => ['qq', 'artist', 'detail', mid] as const,
    artistSongs: (mid: string, page: number) => ['qq', 'artist', 'songs', mid, page] as const,
    artistAlbums: (mid: string) => ['qq', 'artist', 'albums', mid] as const,
    albumDetail: (mid: string) => ['qq', 'album', 'detail', mid] as const,
    lyric: (songmid: string) => ['qq', 'lyric', songmid] as const,
};
