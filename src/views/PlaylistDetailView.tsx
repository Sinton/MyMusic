import React, { useState, useEffect } from 'react';
import { Play, Trash2, Music, AlertTriangle, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../components';
import { Skeleton, ListSkeleton } from '../components/common/Skeleton';
import ShareButton from '../components/common/ShareButton';
import SongList from '../components/SongList';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { songToTrack } from '../lib/trackUtils';
import type { Playlist } from '../types';

interface PlaylistDetailViewProps {
    playlist: Playlist;
    onBack: () => void;
}

const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlist, onBack }) => {
    const { t } = useTranslation();
    const { removeSongFromPlaylist, removePlaylist, updatePlaylistTitle, updatePlaylistCover } = usePlaylistStore();
    const { setTrack, play, setQueue } = usePlayerStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(playlist.title);
    const [isLoading, setIsLoading] = useState(true);
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Simulate network delay for consistency
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSaveTitle = () => {
        if (editTitle.trim()) {
            updatePlaylistTitle(playlist.id, editTitle.trim());
        } else {
            setEditTitle(playlist.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveTitle();
        } else if (e.key === 'Escape') {
            setEditTitle(playlist.title);
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        removePlaylist(playlist.id);
        setShowDeleteModal(false);
        onBack();
    };

    const handleCycleCover = () => {
        const gradients = [
            'bg-gradient-to-br from-indigo-500 to-purple-600',
            'bg-gradient-to-br from-rose-500 to-orange-500',
            'bg-gradient-to-br from-emerald-500 to-teal-500',
            'bg-gradient-to-br from-blue-500 to-cyan-500',
            'bg-gradient-to-br from-amber-500 to-yellow-500',
            'bg-gradient-to-br from-pink-500 to-rose-500',
            'bg-gradient-to-br from-fuchsia-500 to-pink-600',
            'bg-gradient-to-br from-violet-500 to-fuchsia-500'
        ];
        const currentIndex = gradients.indexOf(playlist.cover);
        const nextIndex = (currentIndex + 1) % gradients.length;
        updatePlaylistCover(playlist.id, gradients[nextIndex]);
    };

    const handlePlayAll = () => {
        if (playlist.songs && playlist.songs.length > 0) {
            const tracks = playlist.songs.map(song => songToTrack(song));
            setQueue(tracks);
            setTrack(tracks[0]);
            play();
        }
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in pt-4">
                <div className="flex flex-col md:flex-row gap-8 items-end mb-8">
                    <Skeleton className="w-48 h-48 md:w-60 md:h-60 rounded-2xl shrink-0" />
                    <div className="flex-1 w-full space-y-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-16 w-3/4 md:w-1/2 rounded-lg" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <div className="flex gap-4 mb-8">
                    <Skeleton className="h-12 w-32 rounded-full" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <ListSkeleton rows={8} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Playlist Header */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-8 pt-4">
                <div
                    onClick={handleCycleCover}
                    className={`w-48 h-48 md:w-60 md:h-60 rounded-2xl ${playlist.cover} shadow-2xl flex items-center justify-center relative group cursor-pointer transition-all hover:scale-[1.02] active:scale-95`}
                >
                    <Music className="w-20 h-20 text-white/20 group-hover:opacity-0 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                        <Edit2 className="w-8 h-8 text-white" />
                        <span className="text-white font-bold text-xs uppercase tracking-widest">Change Cover</span>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">{t('playlist.label')}</div>
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={handleKeyDown}
                            className="text-5xl md:text-7xl font-black mb-6 text-[var(--text-main)] tracking-tight leading-none uppercase bg-transparent border-b border-[var(--accent-color)] outline-none w-full"
                        />
                    ) : (
                        <div className="group/title flex items-center gap-4 mb-6">
                            <h1 className="text-5xl md:text-7xl font-black text-[var(--text-main)] tracking-tight leading-none uppercase">
                                {playlist.title}
                            </h1>
                            <button
                                onClick={() => {
                                    setEditTitle(playlist.title);
                                    setIsEditing(true);
                                }}
                                className="opacity-0 group-hover/title:opacity-100 transition-opacity p-2 hover:bg-[var(--glass-highlight)] rounded-full text-[var(--text-secondary)]"
                            >
                                <Edit2 className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-[var(--text-main)]">{playlist.creator}</span>
                        <span className="text-[var(--text-muted)]">•</span>
                        <span className="text-[var(--text-secondary)]">{playlist.songs?.length || 0} {t('playlist.songs')}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 mb-8">
                <button
                    onClick={handlePlayAll}
                    disabled={!playlist.songs || playlist.songs.length === 0}
                    className="flex items-center gap-2 px-8 py-3 bg-[var(--accent-color)] text-white rounded-full font-bold hover:scale-105 transition-all shadow-lg shadow-[var(--accent-color)]/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                    <Play className="w-5 h-5 fill-current" />
                    {t('playlist.playAll')}
                </button>

                <ShareButton text={t('fullPlayer.options.share')} />

                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-3 bg-red-500/5 border border-red-500/10 rounded-full hover:bg-red-500/10 transition-all text-red-500/60 hover:text-red-500"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Songs List */}
            <SongList
                songs={playlist.songs || []}
                renderExtraAction={(song) => (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            removeSongFromPlaylist(playlist.id, song.id);
                        }}
                        className="p-2 hover:text-red-500 transition-all text-[var(--text-muted)]"
                        title="Remove from playlist"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            />

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={t('playlist.delete')}
            >
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center animate-stagger-1">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="space-y-2 animate-stagger-2">
                        <h3 className="text-lg font-bold text-[var(--text-main)]">{t('playlist.deleteConfirmTitle')}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {t('playlist.deleteConfirmDesc', { title: playlist.title })}
                        </p>
                    </div>
                    <div className="w-full space-y-3 pt-2 animate-stagger-3">
                        <button
                            onClick={handleDelete}
                            className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                        >
                            {t('playlist.yesDelete')}
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PlaylistDetailView;
