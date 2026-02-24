import { create } from 'zustand';
import type { PlayerStore, Track } from '../types';
import { getNextIndex, getPreviousIndex } from '../lib/playerUtils';

const EMPTY_TRACK: Track = {
    id: 0,
    title: 'Loading...',
    artist: '...',
    album: '',
    duration: '0:00',
    currentTime: '0:00',
    source: '',
    quality: ''
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    // ================== STATE ==================
    currentTrack: EMPTY_TRACK,
    isPlaying: false,
    volume: 80,
    repeat: 'off',
    shuffle: false,
    currentTimeSec: 0,
    durationSec: 0,
    queue: [],

    // ================== PLAYBACK ACTIONS ==================
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    setTrack: (track: Track) => set({ currentTrack: track, currentTimeSec: 0, isPlaying: true }),
    setVolume: (volume: number) => set({ volume }),
    setProgress: (time: number) => set({ currentTimeSec: time }),
    setQueue: (queue: Track[]) => set({ queue }),

    // ================== MODE ACTIONS ==================
    toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

    cycleRepeat: () => set((state) => {
        const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(state.repeat);
        return { repeat: modes[(currentIndex + 1) % modes.length] };
    }),

    toggleMode: () => set((state) => {
        // Cycle: Shuffle -> Sequential (All) -> Single (One) -> Shuffle
        if (state.shuffle) {
            return { shuffle: false, repeat: 'all' };
        } else if (state.repeat === 'all' || state.repeat === 'off') {
            return { shuffle: false, repeat: 'one' };
        } else {
            return { shuffle: true, repeat: 'all' };
        }
    }),

    // ================== NAVIGATION ACTIONS ==================
    nextTrack: () => {
        const state = get();
        const { queue, currentTrack, shuffle, repeat } = state;
        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);

        const { index: nextIndex, shouldStop } = getNextIndex(
            currentIndex,
            queue.length,
            shuffle,
            repeat
        );

        if (shouldStop) {
            set({ isPlaying: false, currentTimeSec: 0 });
        } else {
            set({
                currentTrack: queue[nextIndex],
                isPlaying: true,
                currentTimeSec: 0
            });
        }
    },

    previousTrack: () => {
        const state = get();
        const { queue, currentTrack, shuffle } = state;
        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);

        const prevIndex = getPreviousIndex(currentIndex, queue.length, shuffle);

        set({
            currentTrack: queue[prevIndex],
            isPlaying: true,
            currentTimeSec: 0
        });
    },
}));
