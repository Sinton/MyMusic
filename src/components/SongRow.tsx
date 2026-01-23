import React, { useState } from 'react';
import { Play, ChevronDown } from 'lucide-react';
import { QualityBadge } from './index';
import type { Song, AudioSource } from '../types';
import { useSongActions } from '../hooks/useSongActions';
import { usePlayerStore } from '../stores/usePlayerStore';
import { SongRowActions } from './song-row/SongRowActions';
import { SongSourceList } from './song-row/SongSourceList';

interface SongRowProps {
    song: Song;
    onPlay?: (song: Song, source?: AudioSource) => void;
    extraAction?: React.ReactNode;
}

const SongRow: React.FC<SongRowProps> = ({ song, onPlay, extraAction }) => {
    const [expanded, setExpanded] = useState(false);

    const {
        isLiked,
        handleLike,
        handlePlaySource
    } = useSongActions(song);

    const currentTrackId = usePlayerStore((state) => state.currentTrack.id);
    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const isCurrent = currentTrackId === song.id;

    const handleSourceClick = (source: AudioSource) => {
        if (onPlay) {
            onPlay(song, source);
        } else {
            handlePlaySource(source);
        }
    };

    const hasHiRes = song.sources.some((s) =>
        s.qualityLabel === 'Hi-Res' || s.qualityLabel === 'Master'
    );

    return (
        <div
            className={`rounded-xl transition-all duration-300 group ${isCurrent
                ? 'bg-[var(--accent-color)]/10 dark:bg-[var(--accent-color)]/20'
                : expanded ? 'bg-[var(--glass-bg)] ring-1 ring-[var(--glass-border)]' : 'hover:bg-[var(--glass-highlight)]'
                } relative`}
        >
            {/* Active Track Indicator Bar */}
            {isCurrent && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--accent-color)] rounded-r-full shadow-[0_0_12px_var(--accent-color)] z-10" />
            )}

            {/* Main Row */}
            <div onClick={() => setExpanded(!expanded)} className="flex items-center p-3 cursor-pointer gap-4 relative">

                {/* Play Button / Visualizer */}
                <div className="w-12 h-12 rounded-lg bg-[var(--glass-border)] shadow-inner flex items-center justify-center text-xs text-[var(--text-muted)] group-hover:bg-[var(--glass-highlight)] transition-colors relative">
                    {isCurrent && isPlaying ? (
                        <div className="flex gap-0.5 items-end h-4">
                            <div className="w-1 bg-[var(--accent-color)] animate-[music-bar_0.6s_ease-in-out_infinite] h-full"></div>
                            <div className="w-1 bg-[var(--accent-color)] animate-[music-bar_0.8s_ease-in-out_infinite] h-2/3"></div>
                            <div className="w-1 bg-[var(--accent-color)] animate-[music-bar_0.5s_ease-in-out_infinite] h-1/2"></div>
                        </div>
                    ) : (
                        <Play className={`w-5 h-5 fill-current ${isCurrent ? 'opacity-100 text-[var(--accent-color)]' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`} />
                    )}
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-main)] truncate">{song.title}</h3>
                        {hasHiRes && <QualityBadge label="Hi-Res" />}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] truncate">
                        {song.artist} • {song.album}
                    </div>
                </div>

                {/* Actions */}
                <SongRowActions
                    song={song}
                    isLiked={isLiked}
                    onToggleLike={handleLike}
                />

                {/* Duration */}
                <div className="text-xs text-[var(--text-muted)] w-12 text-right">{song.duration}</div>

                {extraAction && (
                    <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {extraAction}
                    </div>
                )}

                {/* Expand Chevron */}
                <div className={`p-1 rounded-full transition-transform duration-300 ${expanded ? 'rotate-180 bg-[var(--glass-border)]' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
            </div>

            {/* Expanded Sources List */}
            <SongSourceList
                song={song}
                expanded={expanded}
                onPlaySource={handleSourceClick}
            />
        </div>
    );
};

export default SongRow;
