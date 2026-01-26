import type { Album } from '../../types';
import { unifiedSongs } from './songs';

export const mockAlbums: Album[] = [
    {
        id: 201,
        title: "七里香",
        artist: "周杰伦",
        cover: "https://picsum.photos/seed/jaychou/400/400",
        year: 2004,
        songs: unifiedSongs.filter(s => s.albumId === 201)
    },
    {
        id: 207,
        title: "摩天动物园",
        artist: "G.E.M. 邓紫棋",
        cover: "https://picsum.photos/seed/gem/400/400",
        year: 2019,
        songs: unifiedSongs.filter(s => s.albumId === 207)
    },
    {
        id: 401,
        title: "Lover",
        artist: "Taylor Swift",
        cover: "https://picsum.photos/seed/taylor/400/400",
        year: 2019,
        songs: unifiedSongs.filter(s => s.albumId === 401)
    },
    {
        id: 405,
        title: "HIT ME HARD AND SOFT",
        artist: "Billie Eilish",
        cover: "https://picsum.photos/seed/billie/400/400",
        year: 2024,
        songs: unifiedSongs.filter(s => s.albumId === 405)
    }
];
