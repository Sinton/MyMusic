import type { Track } from '../types';

/**
 * Format seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Parse MM:SS format to seconds
 */
export const parseTime = (timeStr: string): number => {
    const [mins, secs] = timeStr.split(':').map(Number);
    return mins * 60 + secs;
};

/**
 * Get next track index based on current state
 */
export const getNextIndex = (
    currentIndex: number,
    queueLength: number,
    shuffle: boolean,
    repeat: 'off' | 'all' | 'one'
): { index: number; shouldStop: boolean } => {
    if (shuffle) {
        let nextIndex = Math.floor(Math.random() * queueLength);
        // Avoid same track if possible
        if (queueLength > 1 && nextIndex === currentIndex) {
            nextIndex = (nextIndex + 1) % queueLength;
        }
        return { index: nextIndex, shouldStop: false };
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= queueLength) {
        if (repeat === 'off') {
            return { index: currentIndex, shouldStop: true };
        }
        return { index: 0, shouldStop: false };
    }

    return { index: nextIndex, shouldStop: false };
};

/**
 * Get previous track index based on current state
 */
export const getPreviousIndex = (
    currentIndex: number,
    queueLength: number,
    shuffle: boolean
): number => {
    if (shuffle) {
        return Math.floor(Math.random() * queueLength);
    }
    return (currentIndex - 1 + queueLength) % queueLength;
};

/**
 * Get gradient colors for track cover
 */
export const getTrackGradient = (trackId: number): string => {
    const colors = [
        'from-indigo-500 to-purple-500',
        'from-pink-500 to-rose-500',
        'from-blue-500 to-cyan-500',
        'from-amber-500 to-orange-500',
        'from-emerald-500 to-teal-500'
    ];
    return colors[(trackId - 1) % colors.length];
};

/**
 * Find active lyric index based on current time
 */
export const findActiveLyricIndex = (
    lyrics: { time: number; text: string }[],
    currentTimeSec: number
): number => {
    return lyrics.findIndex((lyric, index) => {
        const nextLyric = lyrics[index + 1];
        return currentTimeSec >= lyric.time && (!nextLyric || currentTimeSec < nextLyric.time);
    });
};
