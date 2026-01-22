import { create } from 'zustand';
import type { PlayerState, Track } from '../types';

const defaultTrack: Track = {
    id: 1,
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    duration: '4:03',
    currentTime: '1:24',
    source: 'NetEase Cloud',
    quality: 'Hi-Res Lossless',
};

const mockPlaylist: Track[] = [
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

export const usePlayerStore = create<PlayerState>((set) => ({
    // Current Track
    currentTrack: defaultTrack,

    // Playback State
    isPlaying: false,
    volume: 80,
    repeat: 'off',
    shuffle: false,
    currentTimeSec: 84, // 1:24
    durationSec: 243,   // 4:03
    queue: mockPlaylist,

    // Actions
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    setTrack: (track: Track) => set({ currentTrack: track, currentTimeSec: 0 }),
    setVolume: (volume: number) => set({ volume }),
    toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
    cycleRepeat: () => set((state) => {
        const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(state.repeat);
        return { repeat: modes[(currentIndex + 1) % modes.length] };
    }),
    toggleMode: () => set((state) => {
        // Cycle: Shuffle -> Sequential (All) -> Single (One) -> Shuffle
        if (state.shuffle) {
            // Current is Shuffle -> Switch to Sequential (Shuffle Off, Repeat All)
            return { shuffle: false, repeat: 'all' };
        } else {
            if (state.repeat === 'all' || state.repeat === 'off') { // Treat 'off' as sequential starting point too
                // Current is Sequential -> Switch to Single
                return { shuffle: false, repeat: 'one' };
            } else {
                // Current is Single -> Switch to Shuffle
                return { shuffle: true, repeat: 'all' };
            }
        }
    }),

    nextTrack: () => set((state) => {
        if (state.repeat === 'one' && !state.shuffle) {
            // If manual next in repeat one, usually we allow skipping to next track? 
            // Or repeat current? Standard is Skip. Loop One applies to auto-finish.
            // But here nextTrack is called by UI.
        }

        let nextIndex;
        if (state.shuffle) {
            nextIndex = Math.floor(Math.random() * mockPlaylist.length);
            // Avoid repeat
            if (mockPlaylist.length > 1 && mockPlaylist[nextIndex].id === state.currentTrack.id) {
                nextIndex = (nextIndex + 1) % mockPlaylist.length;
            }
        } else {
            const currentIndex = mockPlaylist.findIndex(t => t.id === state.currentTrack.id);
            if (state.repeat === 'off' && currentIndex === mockPlaylist.length - 1) {
                // Return same state or stop? 
                // Usually for manual click, we might want to wrap or do nothing.
                // But for auto-play, we want stop.
                // Since this action is shared, let's allow Wrap for manual convenience? 
                // But the user complains 'Off' is same as 'All'.
                // So let's make it Stop/Do nothing for Next at end? 
                // Or maybe just wrap to start but PAUSE?
                // Let's loop nextIndex but check bounds.
                nextIndex = currentIndex + 1;
                if (nextIndex >= mockPlaylist.length) {
                    // End of playlist
                    return { isPlaying: false, currentTimeSec: 0 }; // Stop at end
                }
            } else {
                nextIndex = (currentIndex + 1) % mockPlaylist.length;
            }
        }
        return { currentTrack: mockPlaylist[nextIndex], isPlaying: true, currentTimeSec: 0 };
    }),

    previousTrack: () => set((state) => {
        let prevIndex;
        if (state.shuffle) {
            prevIndex = Math.floor(Math.random() * mockPlaylist.length);
        } else {
            const currentIndex = mockPlaylist.findIndex(t => t.id === state.currentTrack.id);
            prevIndex = (currentIndex - 1 + mockPlaylist.length) % mockPlaylist.length;
        }
        return { currentTrack: mockPlaylist[prevIndex], isPlaying: true, currentTimeSec: 0 };
    }),

    setProgress: (time: number) => set({ currentTimeSec: time }),

    // Visualizer State
    visualizerEnabled: true,
    toggleVisualizer: () => set((state) => ({ visualizerEnabled: !state.visualizerEnabled })),
}));
