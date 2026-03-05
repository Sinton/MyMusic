import React, { useState } from 'react';
import { Play, ChevronDown } from 'lucide-react';
import { VipBadge } from '../common';
import type { Song, AudioSource } from '../../types';
import { useSongActions } from '../../hooks/useSongActions';
import { usePlayerStore } from '../../stores/usePlayerStore';
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

    const currentTrack = usePlayerStore((state) => state.currentTrack);
    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const togglePlay = usePlayerStore((state) => state.togglePlay);
    // Use optional chaining carefully - currentTrack might be default/null structure
    const isCurrent = currentTrack && currentTrack.id === song.id;

    // Calculate active source index for indicator matching
    // We match roughly by platform and quality.
    // Note: This relies on source.platform being similar to currentTrack.source "NetEase" vs "NetEase Cloud" translation issues might occur if logic uses display names.
    // But PlayerStore usually stores keys or consistent names. Let's assume keys or loose match.
    const activeSourceIndex = React.useMemo(() => {
        if (!isCurrent || !expanded) return -1;
        if (!currentTrack.source) return -1;

        return song.sources.findIndex(s => {
            // Simple inclusion check or exact match
            const p1 = s.platform.toLowerCase();
            const p2 = currentTrack.source.toLowerCase();
            const q1 = s.qualityLabel.toLowerCase();
            const q2 = currentTrack.quality.toLowerCase();

            // Loose match on platform (as one might be localized or short)
            const platformMatch = p1.includes(p2) || p2.includes(p1);
            // Quality check - currentTrack.quality might be "Standard" etc.
            // If quality is missing in track, ignore it.
            const qualityMatch = !currentTrack.quality || q1 === q2 || (q1 === 'standard' && q2 === 'standard');

            return platformMatch && qualityMatch;
        });
    }, [isCurrent, expanded, currentTrack?.source, currentTrack?.quality, song.sources]);

    // Calculate Indicator Position
    // Main Row: 72px center -> 36px
    // List Start: 72px
    // Separator space: 9px (border 1, margin 8)
    // Row Height: 44px
    // Gap: 8px
    // Formula: 72 + 9 + 8 (gap) + (index * (44 + 8)) + (44 / 2) -> 89 + (index * 52) + 22 -> 111 + (index * 52)
    const indicatorOffset = activeSourceIndex !== -1
        ? 111 + (activeSourceIndex * 52)
        : 36;

    const handleSourceClick = (source: AudioSource) => {
        if (onPlay) {
            onPlay(song, source);
        } else {
            handlePlaySource(source);
        }
    };

    return (
        <div
            className={`rounded-xl transition-all duration-300 group relative ${isCurrent ? 'bg-[var(--accent-color)]/10 dark:bg-[var(--accent-color)]/20' : 'hover:bg-[var(--glass-highlight)]'
                } ${expanded ? 'ring-1 ring-[var(--glass-border)] bg-[var(--glass-bg)]' : ''
                }`}
        >
            {/* Active Track Indicator Bar */}
            {isCurrent && (
                <div
                    className="absolute left-0 w-1 h-6 bg-[var(--accent-color)] rounded-r-full shadow-[0_0_12px_var(--accent-color)] z-10 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{ top: `${indicatorOffset}px`, transform: 'translateY(-50%)' }}
                />
            )}

            {/* Main Row */}
            <div className="flex items-center p-3 gap-4 relative h-[72px]">



                {/* Play Button / Visualizer - Plays Best Source */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();

                        if (isCurrent) {
                            togglePlay();
                        } else {
                            // Find best source logic (Hi-Res > standard) or just first one
                            const bestSource = song.sources.find(s => ['Master', 'Hi-Res', 'SQ', 'HQ'].includes(s.qualityLabel)) || song.sources[0];
                            handleSourceClick(bestSource);
                        }
                    }}
                    className="w-12 h-12 rounded-lg bg-[var(--glass-border)] shadow-inner flex items-center justify-center text-xs text-[var(--text-muted)] hover:bg-[var(--glass-highlight)] transition-colors relative cursor-pointer z-10 hidden-play-button overflow-hidden group/cover"
                >
                    {/* Cover Art */}
                    {song.cover ? (
                        <img
                            src={song.cover}
                            alt={song.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity"
                        />
                    ) : null}

                    {/* Overlay & Play Icon */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${(isCurrent && isPlaying) ? 'bg-black/50 opacity-100' :
                        isCurrent ? 'bg-black/30 opacity-100' :
                            'bg-black/0 opacity-0 group-hover:bg-black/40 group-hover:opacity-100'
                        }`}>
                        {isCurrent && isPlaying ? (
                            <div className="flex gap-0.5 items-end h-4">
                                <div className="w-1 bg-[var(--accent-color)] animate-[music-bar_0.6s_ease-in-out_infinite] h-full"></div>
                                <div className="w-1 bg-[var(--accent-color)] animate-[music-bar_0.8s_ease-in-out_infinite] h-2/3"></div>
                                <div className="w-1 bg-[var(--accent-color)] animate-[music-bar_0.5s_ease-in-out_infinite] h-1/2"></div>
                            </div>
                        ) : (
                            <Play className={`w-5 h-5 fill-current text-[var(--accent-color)] ${(isCurrent || !song.cover) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`} />
                        )}
                    </div>
                </div>

                {/* Clickable Area for Expansion */}
                <div
                    onClick={() => setExpanded(!expanded)}
                    className="absolute inset-0 left-[76px] cursor-pointer flex items-center pr-3"
                >
                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[var(--text-main)] truncate">{song.title}</h3>
                            {song.sources.some(s => s.vip) && (
                                <VipBadge
                                    variant="outline"
                                    platform={song.sources.find(s => s.vip)?.platform}
                                />
                            )}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] truncate">
                            {song.artist} • {song.album}
                        </div>
                    </div>

                    {/* Actions */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <SongRowActions
                            song={song}
                            isLiked={isLiked}
                            onToggleLike={handleLike}
                        />
                    </div>

                    {/* Duration */}
                    <div className="text-xs text-[var(--text-muted)] w-12 text-right ml-4">{song.duration}</div>

                    {extraAction && (
                        <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-4" onClick={(e) => e.stopPropagation()}>
                            {extraAction}
                        </div>
                    )}

                    {/* Expand Chevron */}
                    <div className={`p-1 rounded-full transition-transform duration-300 ml-4 ${expanded ? 'rotate-180 bg-[var(--glass-border)]' : ''}`}>
                        <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                    </div>
                </div>
            </div>

            {/* Expanded Sources List */}
            <SongSourceList
                song={song}
                expanded={expanded}
                onPlaySource={handleSourceClick}
            />
        </div >
    );
};

export default SongRow;
