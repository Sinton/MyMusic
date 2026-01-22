import React from 'react';
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, ListMusic, MessageSquare } from 'lucide-react';
import { VolumeControl } from './index';
import { formatTime } from '../../lib/playerUtils';
import type { Track } from '../../types';

interface PlaybackControlsProps {
    currentTrack: Track;
    isPlaying: boolean;
    shuffle: boolean;
    repeat: 'off' | 'all' | 'one';
    currentTimeSec: number;
    durationSec: number;
    showComments: boolean;
    showQueue: boolean;
    onTogglePlay: () => void;
    onNextTrack: () => void;
    onPreviousTrack: () => void;
    onToggleMode: () => void;
    onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
    onToggleComments: () => void;
    onToggleQueue: () => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
    currentTrack,
    isPlaying,
    shuffle,
    repeat,
    currentTimeSec,
    durationSec,
    showComments,
    showQueue,
    onTogglePlay,
    onNextTrack,
    onPreviousTrack,
    onToggleMode,
    onSeek,
    onToggleComments,
    onToggleQueue
}) => {
    const progressPercent = (currentTimeSec / durationSec) * 100;

    return (
        <div className="relative z-10 px-12 pb-12">
            {/* Scrubber */}
            <div className="flex items-center gap-4 mb-6 group">
                <span className="text-xs text-[var(--text-muted)] w-12 text-right font-mono">{formatTime(currentTimeSec)}</span>
                <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden cursor-pointer relative" onClick={onSeek}>
                    <div className="h-full bg-[var(--text-main)] rounded-full group-hover:bg-[var(--accent-color)] relative transition-all duration-300 ease-linear" style={{ width: `${progressPercent}%` }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] w-12 font-mono">{formatTime(durationSec)}</span>
            </div>

            {/* Main Buttons */}
            <div className="flex items-center justify-between">
                <div className="flex gap-6 w-[120px]">
                    <button onClick={onToggleComments} className={`btn-icon ${showComments ? 'text-[var(--accent-color)]' : 'hover:text-[var(--accent-color)]'}`}>
                        <MessageSquare className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-8">
                    <button onClick={onToggleMode} className={`btn-icon w-10 h-10 transition-colors ${shuffle || repeat === 'one' ? 'text-[var(--accent-color)] active:scale-95' : 'hover:text-white'}`}>
                        {shuffle ? <Shuffle className="w-5 h-5" /> : repeat === 'one' ? <div className="relative"><Repeat className="w-5 h-5" /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[6px] font-bold uppercase pt-0.5">1</span></div> : <Repeat className="w-5 h-5" />}
                    </button>

                    <button onClick={onPreviousTrack} className="btn-icon w-10 h-10 hover:text-white active:scale-90 transition-transform">
                        <SkipBack className="w-8 h-8" />
                    </button>
                    <button onClick={onTogglePlay} className="w-16 h-16 rounded-full bg-[var(--text-main)] text-black flex items-center justify-center hover:scale-105 hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                    </button>
                    <button onClick={onNextTrack} className="btn-icon w-10 h-10 hover:text-white active:scale-90 transition-transform">
                        <SkipForward className="w-8 h-8" />
                    </button>

                    <button onClick={onToggleQueue} className={`btn-icon w-10 h-10 transition-colors ${showQueue ? 'text-[var(--accent-color)]' : 'hover:text-white'}`}>
                        <ListMusic className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-4 items-center justify-end w-[120px]">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.1)] border border-white/10 whitespace-nowrap">
                        <span className="text-[10px] text-[var(--text-muted)] border-r border-white/10 pr-2 mr-0.5">{currentTrack.source}</span>
                        <span className="text-[10px] font-bold text-[#fbbf24]">{currentTrack.quality}</span>
                    </div>
                    <VolumeControl popoverDirection="up" />
                </div>
            </div>
        </div>
    );
};

export default PlaybackControls;
