import React, { useState } from 'react';
import { X, Heart, ListMusic, User, Disc, Share2, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Track, Playlist, Song } from '../../types';

interface OptionsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentTrack: Track;
    userPlaylists: Playlist[];
    onAddToPlaylist: (playlistId: number, song: Song) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
    isOpen,
    onClose,
    currentTrack,
    userPlaylists,
    onAddToPlaylist
}) => {
    const [showShadow, setShowShadow] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setShowShadow(true);
        } else {
            const timer = setTimeout(() => setShowShadow(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const [menuView, setMenuView] = useState<'main' | 'playlist'>('main');

    const handleAddToPlaylist = (playlistId: number) => {
        const songToStore: Song = {
            id: currentTrack.id,
            title: currentTrack.title,
            artist: currentTrack.artist,
            album: currentTrack.album,
            duration: currentTrack.duration,
            sources: [],
            bestSource: currentTrack.source
        };
        onAddToPlaylist(playlistId, songToStore);
        onClose();
        setMenuView('main');
    };

    return (
        <div className={`absolute inset-y-0 right-0 w-full lg:w-[320px] glass-drawer border-l border-[var(--glass-border)] z-[110] transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${showShadow ? 'shadow-[-20px_0_50px_rgba(0,0,0,0.3)]' : ''}`}>
            <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-bold text-[var(--text-main)]">Options</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--glass-highlight)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-2">
                    {menuView === 'main' ? (
                        <>
                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                                <Heart className="w-5 h-5 text-[var(--text-muted)] group-hover:text-pink-500 transition-colors" />
                                <span className="font-medium text-[var(--text-main)]">Like this song</span>
                            </button>
                            <button onClick={() => setMenuView('playlist')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <ListMusic className="w-5 h-5 text-[var(--text-muted)] group-hover:text-amber-500 transition-colors" />
                                    <span className="font-medium text-[var(--text-main)]">Add to Playlist</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                            </button>
                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                                <User className="w-5 h-5 text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors" />
                                <span className="font-medium text-[var(--text-main)]">View Artist</span>
                            </button>
                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                                <Disc className="w-5 h-5 text-[var(--text-muted)] group-hover:text-emerald-400 transition-colors" />
                                <span className="font-medium text-[var(--text-main)]">View Album</span>
                            </button>
                            <div className="my-4 h-px bg-[var(--glass-border)] mx-2"></div>
                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                                <Share2 className="w-5 h-5 text-[var(--text-muted)] group-hover:text-rose-400 transition-colors" />
                                <span className="font-medium text-[var(--text-main)]">Share</span>
                            </button>
                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                                <Clock className="w-5 h-5 text-[var(--text-muted)] group-hover:text-sky-400 transition-colors" />
                                <span className="font-medium text-[var(--text-main)]">Sleep Timer</span>
                            </button>
                        </>
                    ) : (
                        <div className="animate-fade-in space-y-2">
                            <button onClick={() => setMenuView('main')} className="w-full flex items-center gap-4 p-3 mb-4 rounded-xl text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                                <span className="text-sm font-bold">Back to Options</span>
                            </button>
                            {userPlaylists.map(pl => (
                                <button
                                    key={pl.id}
                                    onClick={() => handleAddToPlaylist(pl.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group"
                                >
                                    <div className={`w-10 h-10 rounded-lg ${pl.cover} flex-shrink-0`}></div>
                                    <div className="text-left">
                                        <div className="font-medium text-[var(--text-main)]">{pl.title}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{pl.count} songs</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-auto pt-8">
                    <div className="p-4 rounded-2xl bg-[var(--glass-highlight)] border border-[var(--glass-border)]">
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Playing From</div>
                        <div className="text-sm font-medium text-[var(--text-secondary)]">{currentTrack.source} — {currentTrack.quality}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptionsPanel;
