import { create } from 'zustand';
import type { PlayerStore, Track } from '../types';
import { defaultTrack, initialQueue } from '../data/initialPlayerData';
import { getNextIndex, getPreviousIndex } from '../lib/playerUtils';

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    // ================== STATE ==================
    currentTrack: defaultTrack,
    isPlaying: false,
    volume: 80,
    repeat: 'off',
    shuffle: false,
    currentTimeSec: 84, // 1:24
    durationSec: 243,   // 4:03
    queue: initialQueue,

    // ================== PLAYBACK ACTIONS ==================
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    setTrack: (track: Track) => set({ currentTrack: track, currentTimeSec: 0 }),
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
