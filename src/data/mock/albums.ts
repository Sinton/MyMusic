import type { Album } from '../../types';
import { unifiedSongs } from './songs';

export const mockAlbums: Album[] = [
    {
        id: 18896,
        title: "七里香",
        artist: "周杰伦",
        cover: "http://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
        year: 2004,
        songs: unifiedSongs.filter(s => s.albumId === 18896)
    },
    {
        id: 84083,
        title: "摩天动物园",
        artist: "G.E.M. 邓紫棋",
        cover: "http://p1.music.126.net/CI1W7N-8e2-1r65565556/109951164561139454.jpg",
        year: 2019,
        songs: unifiedSongs.filter(s => s.albumId === 84083)
    },
    {
        id: 81335882,
        title: "Lover",
        artist: "Taylor Swift",
        cover: "http://p1.music.126.net/AgPbzOpY9-1r65565556/109951166702962263.jpg",
        year: 2019,
        songs: unifiedSongs.filter(s => s.albumId === 81335882)
    },
    {
        id: 153026343,
        title: "HIT ME HARD AND SOFT",
        artist: "Billie Eilish",
        cover: "http://p1.music.126.net/B_5pM3vF9-1r65565556/109951166702962263.jpg",
        year: 2024,
        songs: unifiedSongs.filter(s => s.albumId === 153026343)
    }
];
