import type { Track } from '../types';

// ================== DEFAULT TRACK ==================
export const defaultTrack: Track = {
    id: 1,
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    duration: '4:03',
    currentTime: '1:24',
    source: 'NetEase Cloud',
    quality: 'Hi-Res Lossless',
};

// ================== INITIAL QUEUE ==================
export const initialQueue: Track[] = [
    defaultTrack,
    {
        id: 2,
        title: 'Starboy',
        artist: 'The Weeknd',
        album: 'Starboy',
        duration: '3:50',
        currentTime: '0:00',
        source: 'NetEase Cloud',
        quality: 'Hi-Res Lossless',
    },
    {
        id: 3,
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: '3:20',
        currentTime: '0:00',
        source: 'QQ Music',
        quality: 'SQ Lossless',
    },
    {
        id: 4,
        title: 'Physical',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: '3:13',
        currentTime: '0:00',
        source: 'Spotify',
        quality: 'High',
    },
    {
        id: 5,
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: '3:23',
        currentTime: '0:00',
        source: 'Apple Music',
        quality: 'Lossless',
    }
];
