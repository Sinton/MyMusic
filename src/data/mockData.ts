import type { Album, Playlist, Song, HomeCard, Comment, LyricLine } from '../types';

// ================== LYRICS ==================
export const mockLyrics: LyricLine[] = [
    { time: 0, text: "Midnight City - M83" },
    { time: 5, text: "Waiting in a car" },
    { time: 10, text: "Waiting for a ride in the dark" },
    { time: 15, text: "The drinking of a disaster" },
    { time: 20, text: "The silence of the city" },
    { time: 25, text: "Is killing me right now" },
    { time: 30, text: "I'm looking for a way out" },
    { time: 35, text: "Looking for a bright light" },
    { time: 40, text: "Searching for the stars" },
    { time: 45, text: "Waiting for the sun to rise" },
    { time: 50, text: "And the city is a playground" },
    { time: 55, text: "Waiting for the night to end" },
    { time: 60, text: "The city is my friend" },
    { time: 65, text: "The sky is full of stars" },
    { time: 70, text: "Waiting for the sun" },
    { time: 75, text: "Waiting in a car" },
    { time: 80, text: "Waiting for a ride in the dark" },
    { time: 85, text: "The drinking of a disaster" },
    { time: 90, text: "The silence of the city" },
    { time: 95, text: "Is killing me right now" },
    { time: 100, text: "I'm looking for a way out" },
    { time: 105, text: "Looking for a bright light" },
    { time: 110, text: "Searching for the stars" },
    { time: 115, text: "Waiting for the sun to rise" },
    { time: 120, text: "And the city is a playground" },
    { time: 125, text: "Waiting for the night to end" },
    { time: 130, text: "The city is my friend" },
    { time: 135, text: "The sky is full of stars" },
    { time: 140, text: "Waiting for the sun" },
    { time: 145, text: "The city is awake" },
    { time: 150, text: "Waiting in a car" },
    { time: 155, text: "Waiting for a ride in the dark" },
    { time: 160, text: "The drinking of a disaster" },
    { time: 165, text: "The silence of the city" },
    { time: 170, text: "Is killing me right now" },
    { time: 175, text: "I'm looking for a way out" },
    { time: 180, text: "Looking for a bright light" },
    { time: 185, text: "Searching for the stars" },
    { time: 190, text: "Waiting for the sun to rise" },
    { time: 195, text: "And the city is a playground" },
    { time: 200, text: "Waiting for the night to end" },
];

// ================== SONGS ==================
export const unifiedSongs: Song[] = [
    {
        id: 1,
        title: 'Starboy',
        artist: 'The Weeknd / Daft Punk',
        artistId: 101,
        album: 'Starboy',
        albumId: 1,
        duration: '3:50',
        sources: [
            { platform: 'NetEase Cloud', quality: 'HR', qualityLabel: 'Hi-Res', vip: true, color: '#e60026' },
            { platform: 'QQ Music', quality: 'SQ', qualityLabel: 'FLAC', vip: true, color: '#31c27c' },
            { platform: 'Soda Music', quality: 'HQ', qualityLabel: '320k', vip: false, color: '#ffde00' },
        ],
        bestSource: 'NetEase Cloud',
        genre: 'Pop',
    },
    {
        id: 2,
        title: 'Shape of You',
        artist: 'Ed Sheeran',
        artistId: 102,
        album: 'Divide',
        albumId: 2,
        duration: '3:53',
        sources: [
            { platform: 'QQ Music', quality: 'Master', qualityLabel: 'Master', vip: true, color: '#31c27c' },
        ],
        bestSource: 'QQ Music',
        genre: 'Pop',
    },
    {
        id: 3,
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        artistId: 103,
        album: 'A Night at the Opera',
        albumId: 3,
        duration: '5:55',
        sources: [
            { platform: 'Soda Music', quality: 'SQ', qualityLabel: 'FLAC', vip: false, color: '#ffde00' },
        ],
        bestSource: 'Soda Music',
        genre: 'Rock',
    },
    {
        id: 4,
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        artistId: 101,
        album: 'After Hours',
        albumId: 4,
        duration: '3:20',
        sources: [
            { platform: 'NetEase Cloud', quality: 'HR', qualityLabel: 'Hi-Res', vip: true, color: '#e60026' },
            { platform: 'QQ Music', quality: 'SQ', qualityLabel: 'FLAC', vip: false, color: '#31c27c' },
        ],
        bestSource: 'NetEase Cloud',
        genre: 'Electronic',
    },
    // Ed Sheeran More Songs
    {
        id: 501, title: 'Perfect', artist: 'Ed Sheeran', artistId: 102, album: 'Divide', albumId: 2, duration: '4:23',
        sources: [{ platform: 'QQ Music', quality: 'SQ', qualityLabel: 'FLAC', vip: false, color: '#31c27c' }],
        bestSource: 'QQ Music', genre: 'Pop'
    },
    {
        id: 502, title: 'Bad Habits', artist: 'Ed Sheeran', artistId: 102, album: '=', albumId: 5, duration: '3:51',
        sources: [{ platform: 'Soda Music', quality: 'HQ', qualityLabel: '320k', vip: false, color: '#ffde00' }],
        bestSource: 'Soda Music', genre: 'Pop'
    },
    {
        id: 503, title: 'Thinking Out Loud', artist: 'Ed Sheeran', artistId: 102, album: 'x', albumId: 6, duration: '4:41',
        sources: [{ platform: 'NetEase Cloud', quality: 'SQ', qualityLabel: 'FLAC', vip: true, color: '#e60026' }],
        bestSource: 'NetEase Cloud', genre: 'Pop'
    },
    {
        id: 504, title: 'Photograph', artist: 'Ed Sheeran', artistId: 102, album: 'x', albumId: 6, duration: '4:19',
        sources: [{ platform: 'QQ Music', quality: 'HQ', qualityLabel: '320k', vip: false, color: '#31c27c' }],
        bestSource: 'QQ Music', genre: 'Pop'
    },
    // Jay Chou (C-Pop)
    {
        id: 601, title: '七里香 (Qi Li Xiang)', artist: 'Jay Chou', artistId: 104, album: '七里香', albumId: 7, duration: '4:59',
        sources: [{ platform: 'NetEase Cloud', quality: 'SQ', qualityLabel: 'FLAC', vip: true, color: '#e60026' }],
        bestSource: 'NetEase Cloud', genre: 'C-Pop'
    },
    {
        id: 602, title: '青花瓷 (Qing Hua Ci)', artist: 'Jay Chou', artistId: 104, album: '我很忙', albumId: 8, duration: '3:59',
        sources: [{ platform: 'QQ Music', quality: 'SQ', qualityLabel: 'FLAC', vip: true, color: '#31c27c' }],
        bestSource: 'QQ Music', genre: 'C-Pop'
    },
    {
        id: 603, title: '晴天 (Sunny Day)', artist: 'Jay Chou', artistId: 104, album: '叶惠美', albumId: 9, duration: '4:29',
        sources: [{ platform: 'Soda Music', quality: 'HQ', qualityLabel: '320k', vip: false, color: '#ffde00' }],
        bestSource: 'Soda Music', genre: 'C-Pop'
    },
    {
        id: 604, title: '夜曲 (Nocturne)', artist: 'Jay Chou', artistId: 104, album: '十一月的萧邦', albumId: 10, duration: '3:46',
        sources: [{ platform: 'NetEase Cloud', quality: 'HR', qualityLabel: 'Hi-Res', vip: true, color: '#e60026' }],
        bestSource: 'NetEase Cloud', genre: 'C-Pop'
    },
];

// ================== PLAYLISTS ==================
export const playlists: Playlist[] = [
    { id: 1, title: 'Top Hits of 2024', count: 50, creator: 'Spotify', cover: 'bg-purple-600' },
    { id: 2, title: 'Deep Focus', count: 120, creator: 'Apple Music', cover: 'bg-blue-600' },
    { id: 3, title: 'Workout Pump', count: 45, creator: 'Yan', cover: 'bg-red-500' },
    { id: 4, title: 'Chill Lofi Beats', count: 80, creator: 'Lofi Girl', cover: 'bg-emerald-600' },
];

// ================== ALBUMS ==================
export const albums: Album[] = [
    { id: 1, title: 'Starboy', artist: 'The Weeknd', artistId: 101, year: '2016', cover: 'bg-pink-600' },
    { id: 2, title: 'Divide', artist: 'Ed Sheeran', artistId: 102, year: '2017', cover: 'bg-cyan-600' },
    { id: 3, title: 'A Night at the Opera', artist: 'Queen', artistId: 103, year: '1975', cover: 'bg-yellow-600' },
    { id: 4, title: 'After Hours', artist: 'The Weeknd', artistId: 101, year: '2020', cover: 'bg-rose-700' },
    // Ed Sheeran
    { id: 5, title: '=', artist: 'Ed Sheeran', artistId: 102, year: '2021', cover: 'bg-orange-600' },
    { id: 6, title: 'x', artist: 'Ed Sheeran', artistId: 102, year: '2014', cover: 'bg-green-600' },
    { id: 11, title: '+', artist: 'Ed Sheeran', artistId: 102, year: '2011', cover: 'bg-amber-600' },
    { id: 12, title: 'No.6 Collaborations Project', artist: 'Ed Sheeran', artistId: 102, year: '2019', cover: 'bg-gray-800' },
    // Jay Chou
    { id: 7, title: '七里香', artist: 'Jay Chou', artistId: 104, year: '2004', cover: 'bg-emerald-700' },
    { id: 8, title: '我很忙', artist: 'Jay Chou', artistId: 104, year: '2007', cover: 'bg-blue-700' },
    { id: 9, title: '叶惠美', artist: 'Jay Chou', artistId: 104, year: '2003', cover: 'bg-purple-700' },
    { id: 10, title: '十一月的萧邦', artist: 'Jay Chou', artistId: 104, year: '2005', cover: 'bg-indigo-700' },
];

// ================== HOME CARDS ==================
export const homeCards: HomeCard[] = [
    { title: 'Daily Mix 1', description: 'Made for you', color: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
    { title: 'Discover Weekly', description: 'New music every Monday', color: 'bg-gradient-to-br from-green-500 to-emerald-700' },
    { title: 'Release Radar', description: 'Catch up on the latest releases', color: 'bg-gradient-to-br from-gray-700 to-gray-900' },
];

// ================== GENRES ==================
export const genres: string[] = ['Pop', 'Hip-Hop', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Indie', 'K-Pop', 'C-Pop'];

// ================== COMMENTS ==================
export const mockComments: Comment[] = [
    {
        id: 1,
        user: 'Vibe Enthusiast',
        avatar: 'bg-gradient-to-tr from-indigo-500 to-purple-500',
        content: 'This track is absolute fire. The production is out of this world! 🔥🔥🔥',
        time: '2 hours ago',
        likes: 124
    },
    {
        id: 2,
        user: 'Melody Maker',
        avatar: 'bg-gradient-to-tr from-pink-500 to-rose-500',
        content: 'The vocals are so crisp. I haven\'t heard something this clean in a while.',
        time: '5 hours ago',
        likes: 89
    },
];
