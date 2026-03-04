import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { PlaylistShell } from '../components/playlist/PlaylistShell';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { songToTrack } from '../lib/trackUtils';
import type { Playlist, Song } from '../types';

interface PlaylistDetailViewProps {
    playlist: Playlist;
    onBack: () => void;
}

const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlist, onBack }) => {
    const { removeSongFromPlaylist, removePlaylist, updatePlaylistTitle, updatePlaylistCover } = usePlaylistStore();
    const { setTrack, play, setQueue } = usePlayerStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate network delay for consistency
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    const handlePlayAll = () => {
        if (playlist.songs && playlist.songs.length > 0) {
            const tracks = playlist.songs.map(song => songToTrack(song, undefined, { cover: song.cover || playlist.cover }));
            setQueue(tracks);
            setTrack(tracks[0]);
            play();
        }
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
        const currentIndex = gradients.indexOf(playlist.cover || '');
        const nextIndex = (currentIndex + 1) % gradients.length;
        updatePlaylistCover(playlist.id, gradients[nextIndex]);
    };

    const handleDelete = () => {
        removePlaylist(playlist.id);
        onBack();
    };

    return (
        <PlaylistShell
            isLoading={isLoading}
            title={playlist.title}
            cover={playlist.cover || ''}
            songs={playlist.songs || []}
            creator={playlist.creator}
            isEditable={true}
            onPlayAll={handlePlayAll}
            onEditTitle={(newTitle: string) => { updatePlaylistTitle(playlist.id, newTitle); }}
            onCycleCover={handleCycleCover}
            onDelete={handleDelete}
            renderExtraAction={(song: Song) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore - store types vs local types mismatch workaround
                        removeSongFromPlaylist(playlist.id, song.id);
                    }}
                    className="p-2 hover:text-red-500 transition-all text-[var(--text-muted)] group/action relative"
                    title="Remove from playlist"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        />
    );
};

export default PlaylistDetailView;
