import React from 'react';
import { Play, Trash2, Music, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../components';
import ShareButton from '../components/common/ShareButton';
import SongList from '../components/SongList';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { Playlist, Track } from '../types';

interface PlaylistDetailViewProps {
    playlist: Playlist;
    onBack: () => void;
}

const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlist, onBack }) => {
    const { t } = useTranslation();
    const { removeSongFromPlaylist, removePlaylist } = usePlaylistStore();
    const { setTrack, play, setQueue } = usePlayerStore();
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    const handleDelete = () => {
        removePlaylist(playlist.id);
        setShowDeleteModal(false);
        onBack();
    };

    const handlePlayAll = () => {
        if (playlist.songs && playlist.songs.length > 0) {
            const tracks: Track[] = playlist.songs.map(song => ({
                id: song.id,
                title: song.title,
                artist: song.artist,
                artistId: song.artistId,
                album: song.album,
                albumId: song.albumId,
                duration: song.duration,
                currentTime: '0:00',
                source: song.bestSource,
                quality: song.sources[0]?.qualityLabel || 'Standard',
            }));

            setQueue(tracks);
            setTrack(tracks[0]);
            play();
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Playlist Header */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-8 pt-4">
                <div className={`w-48 h-48 md:w-60 md:h-60 rounded-2xl ${playlist.cover} shadow-2xl flex items-center justify-center relative group`}>
                    <Music className="w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">{t('playlist.label')}</div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 text-[var(--text-main)] tracking-tight leading-none uppercase">
                        {playlist.title}
                    </h1>
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
