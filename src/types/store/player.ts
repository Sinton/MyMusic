import type { Track, RepeatMode } from '../domain/music';
export type { RepeatMode } from '../domain/music';

// --- Player Domain State ---
// Re-export RepeatMode if valid or define here if only used in store
// Actually RepeatMode is used in Store mostly.

export interface PlayerState {
    // Core Playback State
    currentTrack: Track;
    isPlaying: boolean;
    volume: number;
    repeat: RepeatMode;
    shuffle: boolean;
    currentTimeSec: number;
    durationSec: number;
    queue: Track[];
}

export interface PlayerActions {
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    setTrack: (track: Track) => void;
    setVolume: (volume: number) => void;
    toggleShuffle: () => void;
    cycleRepeat: () => void;
    toggleMode: () => void;
    nextTrack: () => void;
    previousTrack: () => void;
    setProgress: (time: number) => void;
}

export type PlayerStore = PlayerState & PlayerActions;
