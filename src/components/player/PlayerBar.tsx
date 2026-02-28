import React, { useState } from 'react';
import { Heart, Play, Pause, SkipBack, SkipForward, Maximize2, Repeat, Shuffle, ListMusic } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { usePlayerStore } from '../../stores/usePlayerStore';
import { getPlatformI18nKey } from '../../lib/platformUtils';
import VolumeControl from '../player/VolumeControl';
import { MiniQueuePopup } from '../player-bar/MiniQueuePopup';

interface PlayerBarProps {
    onExpand: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ onExpand }) => {
    const { t } = useTranslation();
    // We can use a local state for this popup or use UIStore.
    // Given the previous refactoring, maybe UIStore is better for consistency,
    // but the requirement "MiniQueuePopup" extraction implies local UI logic is fine for this specific component unless 
    // we want to control it globally. Let's keep it local for now, as it's a specific popover of this bar.
    // Wait, the previous FullScreenPlayer used UIStore for queue panel. 
    // This is the *Mini* queue popup on the bottom bar.
    const [showQueue, setShowQueue] = useState(false);

    const {
        isPlaying,
        togglePlay,
        currentTrack,
        nextTrack,
        previousTrack,
        currentTimeSec,
        durationSec,
        setProgress,
        shuffle,
        repeat,
        toggleMode
    } = usePlayerStore();



    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = durationSec > 0 ? (currentTimeSec / durationSec) * 100 : 0;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        setProgress(Math.floor(percent * durationSec));
    };

    const getTrackColor = (id: string | number) => {
        const colors = [
            'from-indigo-500 to-purple-500',
            'from-pink-500 to-rose-500',
            'from-blue-500 to-cyan-500',
            'from-amber-500 to-orange-500',
            'from-emerald-500 to-teal-500'
        ];
        let numericId;
        if (typeof id === 'string') {
            numericId = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        } else {
            numericId = id;
        }
        return colors[numericId % colors.length];
    };




    const hasTrack = currentTrack && currentTrack.id !== 0;

    return (
        <div
            className={`absolute bottom-6 left-6 right-6 h-[var(--player-height)] z-50 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${hasTrack
                ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
                : 'translate-y-[150%] opacity-0 scale-95 pointer-events-none'
                }`}
        >
            {/* Background Layer to prevent backdrop-filter stacking issues */}
            <div className="absolute inset-0 glass rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[var(--glass-border)] group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)] transition-shadow pointer-events-none" />

            {/* Content Layer */}
            <div className="relative w-full h-full flex items-center px-8 justify-between">
                {/* Left: Track Info */}
                <div
                    onClick={onExpand}
                    className="flex items-center gap-4 w-[300px] cursor-pointer group"
                >
                    <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTrackColor(currentTrack.id)} shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative`}
                    >
                        {currentTrack.cover ? (
                            <img
                                src={currentTrack.cover}
                                alt={currentTrack.title}
                                className="w-full h-full object-cover"
                            />
                        ) : null}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-medium text-[var(--text-main)] truncate">{currentTrack.title}</div>
                        <div className="text-xs text-[var(--text-secondary)] truncate">{currentTrack.artist}</div>
                    </div>
                    <button className="btn-icon text-[var(--text-secondary)] hover:text-[var(--accent-color)]">
                        <Heart className="w-4 h-4" />
                    </button>
                </div>

                {/* Center: Controls */}
                <div className="flex flex-col items-center gap-1 flex-1 max-w-xl">
                    <div className="flex items-center gap-4">
                        {/* Mode Toggle */}
                        <button
                            onClick={toggleMode}
                            className={`btn-icon w-8 h-8 transition-colors ${shuffle || repeat === 'one' ? 'text-[var(--accent-color)] active:scale-95' : 'hover:text-[var(--text-main)]'}`}
                            title={shuffle ? t('playerBar.shuffleOn') : repeat === 'one' ? t('playerBar.singleLoop') : t('playerBar.sequential')}
                        >
                            {shuffle ? (
                                <Shuffle className="w-4 h-4" />
                            ) : repeat === 'one' ? (
                                <div className="relative">
                                    <Repeat className="w-4 h-4" />
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[5px] font-bold uppercase pt-0.5">1</span>
                                </div>
                            ) : (
                                <Repeat className="w-4 h-4" />
                            )}
                        </button>

                        <button onClick={() => previousTrack()} className="btn-icon w-8 h-8 hover:text-[var(--text-main)] active:scale-90 transition-transform"><SkipBack className="w-5 h-5" /></button>
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-[var(--text-main)] text-[var(--bg-color)] flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                        >
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                        <button onClick={() => nextTrack()} className="btn-icon w-8 h-8 hover:text-[var(--text-main)] active:scale-90 transition-transform"><SkipForward className="w-5 h-5" /></button>

                        {/* Queue Button with Popover */}
                        <div className="relative">
                            <button
                                id="queue-toggle-btn"
                                onClick={() => setShowQueue(!showQueue)}
                                className={`btn-icon w-8 h-8 transition-colors ${showQueue ? 'text-[var(--accent-color)]' : 'hover:text-[var(--text-main)]'}`}
                            >
                                <ListMusic className="w-4 h-4" />
                            </button>

                            <MiniQueuePopup isOpen={showQueue} onClose={() => setShowQueue(false)} />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-[10px] text-[var(--text-muted)] w-8 text-right font-mono">{formatTime(currentTimeSec)}</span>
                        <div
                            className="flex-1 h-1 bg-[var(--glass-border)] rounded-full overflow-hidden group cursor-pointer relative"
                            onClick={handleSeek}
                        >
                            <div
                                className="h-full bg-[var(--text-main)] rounded-full group-hover:bg-[var(--accent-color)] transition-all duration-300 ease-linear"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] w-8 font-mono">{formatTime(durationSec)}</span>
                    </div>
                </div>

                {/* Right: Volume & Options */}
                <div className="flex items-center gap-3 w-[300px] justify-end">
                    <div className="text-[10px] text-[var(--text-muted)] mr-2">
                        {t(`platforms.${getPlatformI18nKey(currentTrack.source)}`)} | <span className="text-[#fbbf24]">{currentTrack.quality}</span>
                    </div>
                    <VolumeControl />
                    <button onClick={onExpand} className="btn-icon"><Maximize2 className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

export default PlayerBar;
