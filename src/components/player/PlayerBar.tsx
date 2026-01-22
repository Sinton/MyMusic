import React, { useState } from 'react';
import { Heart, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Maximize2, ListMusic } from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import VolumeControl from './VolumeControl';

interface PlayerBarProps {
    onExpand: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ onExpand }) => {
    const [showQueue, setShowQueue] = useState(false);
    const { isPlaying, togglePlay, currentTrack, nextTrack, previousTrack, currentTimeSec, durationSec, setProgress, queue, setTrack, play, shuffle, repeat, toggleMode } = usePlayerStore();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = (currentTimeSec / durationSec) * 100;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        setProgress(Math.floor(percent * durationSec));
    };

    // Set a consistent color based on track ID
    const getTrackColor = (id: number) => {
        const colors = [
            'from-indigo-500 to-purple-500',
            'from-pink-500 to-rose-500',
            'from-blue-500 to-cyan-500',
            'from-amber-500 to-orange-500',
            'from-emerald-500 to-teal-500'
        ];
        return colors[(id - 1) % colors.length];
    };

    return (
        <div className="absolute bottom-6 left-6 right-6 h-[var(--player-height)] glass rounded-2xl flex items-center px-8 justify-between z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition-all duration-300">
            {/* Left: Track Info */}
            <div
                onClick={onExpand}
                className="flex items-center gap-4 w-[300px] cursor-pointer group"
            >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTrackColor(currentTrack.id)} shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform`}></div>
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
                    {/* Mode Toggle: Shuffle -> Sequential -> Single */}
                    <button
                        onClick={toggleMode}
                        className={`btn-icon w-8 h-8 transition-colors ${shuffle || repeat === 'one' ? 'text-[var(--accent-color)] active:scale-95' : 'hover:text-white'}`}
                        title={shuffle ? 'Shuffle On' : repeat === 'one' ? 'Single Loop' : 'Sequential'}
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

                    <button onClick={previousTrack} className="btn-icon w-8 h-8 hover:text-white active:scale-90 transition-transform"><SkipBack className="w-5 h-5" /></button>
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-[var(--text-main)] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <button onClick={nextTrack} className="btn-icon w-8 h-8 hover:text-white active:scale-90 transition-transform"><SkipForward className="w-5 h-5" /></button>

                    {/* Queue Button with Popover */}
                    <div className="relative">
                        <button
                            onClick={() => setShowQueue(!showQueue)}
                            className={`btn-icon w-8 h-8 transition-colors ${showQueue ? 'text-[var(--accent-color)]' : 'hover:text-white'}`}
                        >
                            <ListMusic className="w-4 h-4" />
                        </button>

                        {/* Play Queue Popup (Positioned relative to button) */}
                        {showQueue && (
                            <div
                                className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-80 max-h-[500px] glass rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100]"
                            >
                                <div className="p-4 border-b border-white/5 bg-white/5">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <ListMusic className="w-4 h-4 text-[var(--accent-color)]" />
                                        Next Up
                                    </h3>
                                </div>
                                <div className="overflow-y-auto max-h-[440px] p-2 space-y-1 custom-scrollbar-none">
                                    {queue.map((track) => {
                                        const isCurrent = track.id === currentTrack.id;
                                        return (
                                            <div
                                                key={track.id}
                                                onClick={() => {
                                                    setTrack(track);
                                                    play();
                                                    setShowQueue(false);
                                                }}
                                                className={`
                                                    flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all group
                                                    ${isCurrent ? 'bg-[var(--accent-color)]/20 shadow-inner' : 'hover:bg-white/5'}
                                                `}
                                            >
                                                <div className={`w-10 h-10 rounded bg-gradient-to-br ${getTrackColor(track.id)} flex-shrink-0 flex items-center justify-center`}>
                                                    {isCurrent && isPlaying ? (
                                                        <div className="flex gap-0.5 items-end h-3">
                                                            <div className="w-0.5 bg-white animate-[music-bar_0.6s_ease-in-out_infinite] h-full"></div>
                                                            <div className="w-0.5 bg-white animate-[music-bar_0.8s_ease-in-out_infinite] h-2/3"></div>
                                                            <div className="w-0.5 bg-white animate-[music-bar_0.7s_ease-in-out_infinite] h-5/6"></div>
                                                        </div>
                                                    ) : (
                                                        <Play className={`w-3 h-3 text-white fill-current opacity-0 group-hover:opacity-100 transition-opacity`} />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className={`text-xs font-medium truncate ${isCurrent ? 'text-[var(--accent-color)]' : 'text-white'}`}>
                                                        {track.title}
                                                    </div>
                                                    <div className="text-[10px] text-[var(--text-secondary)] truncate">
                                                        {track.artist}
                                                    </div>
                                                </div>
                                                {isCurrent && (
                                                    <div className="w-1 h-1 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                    <span className="text-[10px] text-[var(--text-muted)] w-8 text-right font-mono">{formatTime(currentTimeSec)}</span>
                    <div
                        className="flex-1 h-1 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden group cursor-pointer relative"
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
                    {currentTrack.source} | <span className="text-[#fbbf24]">{currentTrack.quality}</span>
                </div>
                <VolumeControl />
                <button onClick={onExpand} className="btn-icon"><Maximize2 className="w-4 h-4" /></button>
            </div>


        </div>
    );
};

export default PlayerBar;
