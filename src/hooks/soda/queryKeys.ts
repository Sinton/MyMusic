export const SODA_KEYS = {
    all: ['soda'] as const,
    artist: () => [...SODA_KEYS.all, 'artist'] as const,
    artistDetail: (id: string | number) => [...SODA_KEYS.artist(), 'detail', String(id)] as const,
    album: () => [...SODA_KEYS.all, 'album'] as const,
    albumDetail: (id: string | number) => [...SODA_KEYS.album(), 'detail', String(id)] as const,
    trackDetail: (id: string | number) => [...SODA_KEYS.all, 'track', 'detail', String(id)] as const,
    search: (keywords: string) => [...SODA_KEYS.all, 'search', keywords] as const,
    lyric: (id: string | number) => [...SODA_KEYS.all, 'lyric', String(id)] as const,
};
