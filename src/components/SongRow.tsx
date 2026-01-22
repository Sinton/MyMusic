import React, { useState } from 'react';
import { Play, ChevronDown, Heart, Plus, Check } from 'lucide-react';
import { QualityBadge, PlatformBadge, VipBadge } from './index';
import type { Song, AudioSource } from '../types';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { usePlayerStore } from '../stores/usePlayerStore';

interface SongRowProps {
    song: Song;
    onPlay?: (song: Song, source?: AudioSource) => void;
    extraAction?: React.ReactNode;
}

const SongRow: React.FC<SongRowProps> = ({ song, onPlay, extraAction }) => {
    const [expanded, setExpanded] = useState(false);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
    const { userPlaylists, addSongToPlaylist, likedSongs, toggleLike } = usePlaylistStore();
    const { play, setTrack } = usePlayerStore();

    const isLiked = likedSongs.some(s => s.id === song.id);

    const handlePlaySource = (source: AudioSource) => {
        if (onPlay) {
            onPlay(song, source);
        } else {
            const track: any = {
                id: song.id,
                title: song.title,
                artist: song.artist,
                album: song.album,
                duration: song.duration,
                currentTime: '0:00',
                source: source.platform,
                quality: source.qualityLabel
            };
            setTrack(track);
            play();
        }
    };

    const hasHiRes = song.sources.some((s) =>
        s.qualityLabel === 'Hi-Res' || s.qualityLabel === 'Master'
    );

    return (
        <div
            className={`rounded-xl transition-all duration-300 group ${showPlaylistMenu ? 'z-[60] bg-[rgba(255,255,255,0.08)]' : 'z-auto'
                } ${expanded ? 'bg-[rgba(255,255,255,0.08)] ring-1 ring-[var(--glass-border)]' : 'hover:bg-[rgba(255,255,255,0.05)]'
                } relative`}
        >
            {/* Main Row */}
            <div onClick={() => setExpanded(!expanded)} className="flex items-center p-3 cursor-pointer gap-4 relative">
                <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.1)] shadow-inner flex items-center justify-center text-xs text-[var(--text-muted)] group-hover:bg-[rgba(255,255,255,0.15)] transition-colors">
                    <Play className="w-5 h-5 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-main)] truncate">{song.title}</h3>
                        {hasHiRes && <QualityBadge label="Hi-Res" />}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] truncate">
                        {song.artist} • {song.album}
                    </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                        className={`p-2 transition-colors ${isLiked ? 'text-rose-500' : 'text-[var(--text-muted)] hover:text-white'}`}
                    >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(!showPlaylistMenu); }}
                            className={`p-2 transition-colors ${showPlaylistMenu ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-white'}`}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        {showPlaylistMenu && (
                            <div
                                className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 py-1 mb-1">Add to Playlist</div>
                                {userPlaylists.map(pl => (
                                    <button
                                        key={pl.id}
                                        onClick={() => {
                                            addSongToPlaylist(pl.id, song);
                                            setShowPlaylistMenu(false);
                                        }}
                                        className="w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-[var(--text-secondary)] hover:text-white"
                                    >
                                        <span className="truncate">{pl.title}</span>
                                        {pl.songs?.some(s => s.id === song.id) && <Check className="w-3 h-3 text-[var(--accent-color)]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-xs text-[var(--text-muted)] w-12 text-right">{song.duration}</div>
                {extraAction && (
                    <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {extraAction}
                    </div>
                )}
                <div className={`p-1 rounded-full transition-transform duration-300 ${expanded ? 'rotate-180 bg-[rgba(0,0,0,0.2)]' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
            </div>

            {/* Expanded Sources */}
            <div
                className={`grid gap-2 px-4 transition-all duration-300 ease-in-out ${expanded ? 'pb-4 opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
            >
                <div className="h-[1px] bg-[var(--glass-border)] mx-1 mb-2"></div>
                {song.sources.map((source, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.3)] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <PlatformBadge name={source.platform} color={source.color} size="sm" />
                            <span className="text-sm text-[var(--text-main)]">{source.platform}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <QualityBadge label={source.qualityLabel} />
                            {source.vip && <VipBadge variant="outline" />}
                            <button
                                onClick={() => handlePlaySource(source)}
                                className="p-1.5 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[var(--text-main)] hover:text-black transition-colors"
                            >
                                <Play className="w-3 h-3 fill-current" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SongRow;
