import React from 'react';
import { Play, Share2, Trash2, Music, AlertTriangle, Check } from 'lucide-react';
import { SongRow, Modal } from '../components';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { Playlist } from '../types';

interface PlaylistDetailViewProps {
    playlist: Playlist;
    onBack: () => void;
}

const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlist, onBack }) => {
    const { removeSongFromPlaylist, removePlaylist } = usePlaylistStore();
    const { setTrack, play } = usePlayerStore();
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [isShared, setIsShared] = React.useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
    };

    const handleDelete = () => {
        removePlaylist(playlist.id);
        setShowDeleteModal(false);
        onBack();
    };

    const handlePlayAll = () => {
        if (playlist.songs && playlist.songs.length > 0) {
            const firstSong = playlist.songs[0];
            const track: any = {
                id: firstSong.id,
                title: firstSong.title,
                artist: firstSong.artist,
                album: firstSong.album,
                duration: firstSong.duration,
                currentTime: '0:00',
                source: firstSong.bestSource,
                quality: firstSong.sources[0]?.qualityLabel || 'Standard',
            };
            setTrack(track);
            play();
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Playlist Header */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-8 pt-4">
                <div className={`w-48 h-48 md:w-60 md:h-60 rounded-2xl ${playlist.cover} shadow-2xl flex items-center justify-center relative group`}>
                    <Music className="w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Playlist</div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tight leading-none uppercase">
                        {playlist.title}
                    </h1>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-white">{playlist.creator}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-[var(--text-secondary)]">{playlist.songs?.length || 0} songs</span>
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
                    Play All
                </button>

                <button
                    onClick={handleShare}
                    className={`p-3 border rounded-full transition-all flex items-center gap-2 ${isShared
                        ? 'bg-green-500/10 border-green-500/20 text-green-500'
                        : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white'
                        }`}
                >
                    {isShared ? (
                        <>
                            <Check className="w-5 h-5" />
                            <span className="text-xs font-bold pr-1">Link Copied</span>
                        </>
                    ) : (
                        <Share2 className="w-5 h-5" />
                    )}
                </button>

                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-3 bg-red-500/5 border border-red-500/10 rounded-full hover:bg-red-500/10 transition-all text-red-500/60 hover:text-red-500"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Songs List */}
            <div className="space-y-3 pb-20">
                <div className="flex items-center px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] border-b border-white/5 mb-2">
                    <div className="w-8">#</div>
                    <div className="flex-1">Title</div>
                    <div className="w-32 hidden md:block">Album</div>
                    <div className="w-20 text-right">Time</div>
                </div>

                {!playlist.songs || playlist.songs.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-[var(--text-secondary)] border-2 border-dashed border-white/5 rounded-3xl">
                        <Music className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium">This playlist is empty</p>
                        <p className="text-xs opacity-50">Add some songs to get started</p>
                    </div>
                ) : (
                    playlist.songs.map((song) => (
                        <SongRow
                            key={song.id}
                            song={song}
                            extraAction={
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeSongFromPlaylist(playlist.id, song.id);
                                    }}
                                    className="p-2 hover:text-red-500 transition-all text-white/20"
                                    title="Remove from playlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            }
                        />
                    ))
                )}
            </div>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Playlist"
            >
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center animate-stagger-1">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="space-y-2 animate-stagger-2">
                        <h3 className="text-lg font-bold text-white">Are you sure?</h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            This will permanently delete <span className="text-white font-bold">"{playlist.title}"</span>. This action cannot be undone.
                        </p>
                    </div>
                    <div className="w-full space-y-3 pt-2 animate-stagger-3">
                        <button
                            onClick={handleDelete}
                            className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                        >
                            Yes, Delete Playlist
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PlaylistDetailView;
