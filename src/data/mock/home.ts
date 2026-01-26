import type { HomeCard } from '../../types';

export const homeSections = [
    {
        title: "home.sections.madeForYou",
        cards: [
            { id: 1001, title: '华语金曲精选', subtitle: 'Vibe Music', type: 'playlist', cover: 'bg-gradient-to-br from-red-500 to-rose-600' },
            { id: 1002, title: 'Late Night Vibes', subtitle: 'Yan', type: 'playlist', cover: 'bg-gradient-to-br from-indigo-500 to-purple-800' },
            { id: 201, title: '七里香', subtitle: '周杰伦', type: 'album', cover: 'https://picsum.photos/seed/jaychou/400/400' },
            { id: 101, title: 'Cruel Summer', subtitle: 'Taylor Swift', type: 'song', cover: 'https://picsum.photos/seed/taylor/400/400' },
        ] as HomeCard[]
    },
    {
        title: "home.sections.newReleases",
        cards: [
            { id: 103, title: 'Die With A Smile', subtitle: 'Lady Gaga & Bruno Mars', type: 'song', cover: 'bg-blue-800' },
            { id: 405, title: 'HIT ME HARD AND SOFT', subtitle: 'Billie Eilish', type: 'album', cover: 'bg-blue-600' },
            { id: 17, title: '起风了', subtitle: '买辣椒也用券', type: 'song', cover: 'bg-teal-500' },
            { id: 207, title: '摩天动物园', subtitle: 'G.E.M. 邓紫棋', type: 'album', cover: 'bg-gray-800' },
        ] as HomeCard[]
    },
    {
        title: "home.sections.chartToppers",
        cards: [
            { id: 5, title: '江南', subtitle: '林俊杰', type: 'song', cover: 'bg-amber-600' },
            { id: 1, title: '七里香', subtitle: '周杰伦', type: 'song', cover: 'bg-orange-500' },
            { id: 3, title: '十年', subtitle: '陈奕迅', type: 'song', cover: 'bg-zinc-600' },
            { id: 104, title: 'Yellow', subtitle: 'Coldplay', type: 'song', cover: 'bg-yellow-400' },
        ] as HomeCard[]
    }
];

export const genres = ['Pop', 'Rock', 'Folk', 'R&B', 'Alternative', 'Electronic', 'Jazz', 'Classical'];
