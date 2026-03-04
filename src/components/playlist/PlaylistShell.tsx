import React, { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Play, Music, Cloud, Edit2, AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton, ListSkeleton } from '../common/Skeleton';
import ShareButton from '../common/ShareButton';
import { Modal } from '../common/Modal';
import SongRow from '../music/SongRow';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { songToTrack } from '../../lib/trackUtils';
import type { Song, AudioSource } from '../../types';

export interface PlaylistShellProps {
    // Data
    isLoading: boolean;
    title: string;
    cover: string;
    creator?: string;
    songs: Song[];

    // Header Tag
    HeaderIcon?: React.ElementType;
    headerTagText?: string;
    headerTagColorClass?: string;

    // Mode
    isEditable?: boolean;

    // Actions - Global
    onPlayAll: () => void;

    // Actions - Item Level
    onPlaySong?: (song: Song, source?: AudioSource) => void;
    renderExtraAction?: (song: Song) => React.ReactNode;

    // Actions - Editing
    onEditTitle?: (newTitle: string) => void;
    onCycleCover?: () => void;
    onDelete?: () => void;
}

export const PlaylistShell: React.FC<PlaylistShellProps> = ({
    isLoading,
    title,
    cover,
    creator,
    songs,
    HeaderIcon,
    headerTagText,
    headerTagColorClass = "text-red-500",
    isEditable = false,
    onPlayAll,
    onPlaySong,
    renderExtraAction,
    onEditTitle,
    onCycleCover,
    onDelete
}) => {
    const { t } = useTranslation();
    const { setTrack, play, setQueue } = usePlayerStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Virtuallizer
    const scrollRef = useRef<Element | null>(null);
    if (typeof document !== 'undefined' && !scrollRef.current) {
        scrollRef.current = document.querySelector('.main-scroller');
    }

    const rowVirtualizer = useVirtualizer({
        count: songs.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 64, // Estimated height 56px + 8px
        overscan: 10,
    });

    React.useEffect(() => {
        setEditTitle(title);
    }, [title]);

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSaveTitle = () => {
        if (editTitle.trim() && onEditTitle) {
            onEditTitle(editTitle.trim());
        } else {
            setEditTitle(title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveTitle();
        } else if (e.key === 'Escape') {
            setEditTitle(title);
            setIsEditing(false);
        }
    };

    const defaultPlaySong = (song: Song, source?: AudioSource) => {
        if (songs.length > 0) {
            const selectedTrack = songToTrack(song, source, { cover: song.cover || cover });
            const currentQueue = usePlayerStore.getState().queue;
            if (!currentQueue.find(t => t.id === selectedTrack.id)) {
                setQueue([...currentQueue, selectedTrack]);
            }
            setTrack(selectedTrack);
            play();
        }
    };

    const handlePlaySongAction = onPlaySong || defaultPlaySong;

    if (isLoading) {
        return (
            <div className="animate-fade-in pt-4">
                <div className="flex flex-col md:flex-row gap-8 items-end mb-8 mt-6">
                    <Skeleton className="w-48 h-48 md:w-60 md:h-60 rounded-2xl shrink-0" />
                    <div className="flex-1 w-full space-y-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-16 w-3/4 md:w-1/2 rounded-lg" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <div className="flex gap-4 mb-8">
                    <Skeleton className="h-12 w-32 rounded-full" />
                </div>
                <ListSkeleton rows={8} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-20">
            {/* Playlist Header */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-8 mt-10">
                <div
                    className="w-48 h-48 md:w-60 md:h-60 rounded-2xl shadow-2xl overflow-hidden relative group flex-shrink-0 cursor-pointer"
                    onClick={isEditable ? onCycleCover : undefined}
                >
                    {cover ? (
                        <>
                            {cover.startsWith('http') || cover.startsWith('data:') ? (
                                <img src={cover} alt={title || 'Cover'} className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full ${cover} flex items-center justify-center`}>
                                    <Music className="w-20 h-20 text-white/20" />
                                </div>
                            )}
                            {isEditable && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-white font-medium flex items-center gap-2">
                                        <Cloud className="w-5 h-5" />
                                        {t('playlist.changeCover', 'Change Cover')}
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-500/30 to-pink-500/30 flex items-center justify-center">
                            <Music className="w-20 h-20 text-white/20" />
                        </div>
                    )}
                </div>

                <div className="flex-1 w-full">
                    {HeaderIcon && headerTagText && (
                        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 ${headerTagColorClass}`}>
                            <HeaderIcon className="w-3 h-3" />
                            {headerTagText}
                        </div>
                    )}

                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={handleKeyDown}
                            className="text-5xl md:text-7xl font-black text-[var(--text-main)] bg-transparent border-b-2 border-[var(--accent-color)] focus:outline-none w-full mb-6 py-2"
                        />
                    ) : (
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6 group">
                            <h1 className="text-5xl md:text-7xl font-black text-[var(--text-main)] tracking-tight leading-none">
                                {title || t('playlist.titleCol', 'Title')}
                            </h1>
                            {isEditable && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-[var(--glass-highlight)] rounded-xl transition-all mb-1 text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                                >
                                    <Edit2 className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm font-medium">
                        {creator && (
                            <>
                                <span className="text-[var(--text-main)]">{creator}</span>
                                <span className="text-[var(--text-muted)]">•</span>
                            </>
                        )}
                        <span className="text-[var(--text-secondary)]">{songs.length} {t('playlist.songs', '首')}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 mb-8">
                <button
                    onClick={onPlayAll}
                    disabled={songs.length === 0}
                    className="flex flex-shrink-0 items-center justify-center gap-2 px-8 py-3 bg-[var(--accent-color)] text-white rounded-full font-bold hover:scale-105 transition-all shadow-lg shadow-[var(--accent-color)]/20 disabled:opacity-50 disabled:hover:scale-100 truncate"
                >
                    <Play className="w-5 h-5 fill-current" />
                    {t('playlist.playAll', '播放全部')}
                </button>

                <ShareButton text={t('fullPlayer.options.share', '分享')} />

                {onDelete && isEditable && (
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-3 bg-red-500/5 border border-red-500/10 rounded-full hover:bg-red-500/10 transition-all text-red-500/60 hover:text-red-500 ml-auto"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Songs List */}
            {songs.length > 0 ? (
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative'
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                        const song = songs[virtualItem.index];
                        return (
                            <div
                                key={virtualItem.key}
                                data-index={virtualItem.index}
                                ref={rowVirtualizer.measureElement}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualItem.start}px)`,
                                    paddingBottom: '8px'
                                }}
                            >
                                <SongRow
                                    song={song}
                                    onPlay={handlePlaySongAction}
                                    extraAction={renderExtraAction ? renderExtraAction(song) : undefined}
                                />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-48 flex flex-col items-center justify-center text-[var(--text-muted)] space-y-4">
                    <Music className="w-16 h-16 opacity-20" />
                    <p>{t('playlist.empty', '暂无歌曲')}</p>
                </div>
            )}

            {/* Delete Modal */}
            {onDelete && isEditable && (
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title={t('playlist.delete', '删除歌单')}
                >
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center animate-stagger-1">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="space-y-2 animate-stagger-2">
                            <h3 className="text-lg font-bold text-[var(--text-main)]">{t('playlist.deleteConfirmTitle', '确认删除')}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {t('playlist.deleteConfirmDesc', { title })}
                            </p>
                        </div>
                        <div className="w-full space-y-3 pt-2 animate-stagger-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    onDelete();
                                }}
                                className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                            >
                                {t('playlist.yesDelete', '确认删除')}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                            >
                                {t('common.cancel', '取消')}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default PlaylistShell;
