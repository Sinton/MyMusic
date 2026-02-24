import type { Playlist } from '../../types';
import { unifiedSongs } from './songs';

export const mockPlaylists: Playlist[] = [
    {
        id: 1001,
        title: "华语金曲精选",
        count: 10,
        creator: "Vibe Music",
        cover: "bg-gradient-to-br from-red-500 to-rose-600",
        songs: unifiedSongs.filter(s => ['周杰伦', '陈奕迅', '林俊杰', '王菲'].includes(s.artist))
    },
    {
        id: 1002,
        title: "Late Night Vibes",
        count: 8,
        creator: "Yan",
        cover: "bg-gradient-to-br from-indigo-500 to-purple-800",
        songs: unifiedSongs.filter(s => !['周杰伦', '陈奕迅', '林俊杰', '王菲', '李荣浩', '朴树', '买辣椒也用券', '毛不易', 'G.E.M. 邓紫棋', '五月天'].includes(s.artist))
    },
    {
        id: 1003,
        title: "周杰伦全集",
        count: 2,
        creator: "Jay Fan",
        cover: "bg-gradient-to-br from-pink-500 to-rose-400",
        songs: unifiedSongs.filter(s => s.artist === '周杰伦')
    }
];
