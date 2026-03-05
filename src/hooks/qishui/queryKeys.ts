export const QISHUI_KEYS = {
    all: ['qishui'] as const,
    artist: () => [...QISHUI_KEYS.all, 'artist'] as const,
    artistDetail: (id: string | number) => [...QISHUI_KEYS.artist(), 'detail', String(id)] as const,
    album: () => [...QISHUI_KEYS.all, 'album'] as const,
    albumDetail: (id: string | number) => [...QISHUI_KEYS.album(), 'detail', String(id)] as const,
    trackDetail: (id: string | number) => [...QISHUI_KEYS.all, 'track', 'detail', String(id)] as const,
    search: (keywords: string) => [...QISHUI_KEYS.all, 'search', keywords] as const,
    lyric: (id: string | number) => [...QISHUI_KEYS.all, 'lyric', String(id)] as const,
};
