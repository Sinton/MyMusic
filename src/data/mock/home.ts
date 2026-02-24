import type { HomeCard } from '../../types';

export const homeSections = [
    {
        title: "home.sections.madeForYou",
        cards: [
            { id: 1001, title: '华语金曲精选', subtitle: 'Vibe Music', type: 'playlist', cover: 'bg-gradient-to-br from-red-500 to-rose-600' },
            { id: 1002, title: 'Late Night Vibes', subtitle: 'Yan', type: 'playlist', cover: 'bg-gradient-to-br from-indigo-500 to-purple-800' },
            { id: 18896, title: '七里香', subtitle: '周杰伦', type: 'album', cover: 'http://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
            { id: 1385963242, title: 'Cruel Summer', subtitle: 'Taylor Swift', type: 'song', cover: 'http://p1.music.126.net/AgPbzOpY9-1r65565556/109951166702962263.jpg' },
        ] as HomeCard[]
    },
    {
        title: "home.sections.newReleases",
        cards: [
            { id: 2621430939, title: 'Die With A Smile', subtitle: 'Lady Gaga & Bruno Mars', type: 'song', cover: 'http://p1.music.126.net/B_5pM3vF9-1r65565556/109951166702962263.jpg' },
            { id: 153026343, title: 'HIT ME HARD AND SOFT', subtitle: 'Billie Eilish', type: 'album', cover: 'http://p1.music.126.net/B_5pM3vF9-1r65565556/109951166702962263.jpg' },
            { id: 541687281, title: '起风了', subtitle: '买辣椒也用券', type: 'song', cover: 'http://p1.music.126.net/diGAyEmpymX8Y-rSpmnlCS==/109951163699673355.jpg' },
            { id: 84083, title: '摩天动物园', subtitle: 'G.E.M. 邓紫棋', type: 'album', cover: 'http://p1.music.126.net/CI1W7N-8e2-1r65565556/109951164561139454.jpg' },
        ] as HomeCard[]
    },
    {
        title: "home.sections.chartToppers",
        cards: [
            { id: 108390, title: '江南', subtitle: '林俊杰', type: 'song', cover: 'http://p2.music.126.net/W_5pM3vF9-1r65565556/109951166702962263.jpg' },
            { id: 186016, title: '七里香', subtitle: '周杰伦', type: 'song', cover: 'http://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg' },
            { id: 64093, title: '十年', subtitle: '陈奕迅', type: 'song', cover: 'http://p2.music.126.net/w8148m1m-2v4e6u2d3j3sA==/3408486047240392.jpg' },
            { id: 1391211776, title: 'Yellow', subtitle: 'Coldplay', type: 'song', cover: 'http://p1.music.126.net/B_5pM3vF9-1r65565556/109951166702962263.jpg' },
        ] as HomeCard[]
    }
];

export const genres = ['Pop', 'Rock', 'Folk', 'R&B', 'Alternative', 'Electronic', 'Jazz', 'Classical'];
