import React, { useRef, useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useSongActions } from '../../hooks/useSongActions';
import type { Song } from '../../types';

import { useTranslation } from 'react-i18next';

interface SongRowActionsProps {
    song: Song;
    isLiked: boolean;
    onToggleLike: () => void;
}

export const SongRowActions: React.FC<SongRowActionsProps> = ({ song, isLiked, onToggleLike }) => {
    const { t } = useTranslation();
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { userPlaylists, handleAddToPlaylist, isInPlaylist } = useSongActions(song);

    // Close menu when clicking outside (simple implementation for now)
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowPlaylistMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" ref={wrapperRef}>
            {/* Like Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
                className={`p-2 transition-colors ${isLiked ? 'text-rose-500' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
            </button>

            {/* Playlist Menu */}
            <div className="relative">
                <button
                    onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(!showPlaylistMenu); }}
                    className={`p-2 transition-colors ${showPlaylistMenu ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                    <Plus className="w-4 h-4" />
                </button>

                {showPlaylistMenu && (
                    <div
                        className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 py-1 mb-1">
                            {t('fullPlayer.options.addToPlaylist')}
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {userPlaylists.map(pl => (
                                <button
                                    key={pl.id}
                                    onClick={() => {
                                        handleAddToPlaylist(pl.id);
                                        setShowPlaylistMenu(false);
                                    }}
                                    className="w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-[var(--glass-highlight)] transition-colors text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                                >
                                    <span className="truncate">{pl.title}</span>
                                    {isInPlaylist(pl.id) && <Check className="w-3 h-3 text-[var(--accent-color)]" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
