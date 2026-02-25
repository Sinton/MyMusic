import React from 'react';
import { Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SongRow } from './index';
import { usePlayerStore } from '../stores/usePlayerStore';
import { songToTrack } from '../lib/trackUtils';
import type { Song, AudioSource } from '../types';

interface SongListProps {
    songs: Song[];
    renderExtraAction?: (song: Song) => React.ReactNode;
    emptyMessage?: string;
    emptyDescription?: string;
    showHeader?: boolean;
}

const SongList: React.FC<SongListProps> = ({
    songs,
    renderExtraAction,
    emptyMessage,
    emptyDescription,
    showHeader = true
}) => {
    const { t } = useTranslation();
    const { setTrack, setQueue, play } = usePlayerStore();

    const handlePlaySong = (song: Song, source?: AudioSource) => {
        if (!songs || songs.length === 0) return;

        const selectedTrack = songToTrack(song, source);

        const currentQueue = usePlayerStore.getState().queue;
        if (!currentQueue.find(t => t.id === selectedTrack.id)) {
            setQueue([...currentQueue, selectedTrack]);
        }

        setTrack(selectedTrack);
        play();
    };

    const renderHeader = () => (
        <div className="flex items-center px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--glass-border)] mb-2">
            <div className="w-12 text-center">#</div>
            <div className="flex-1 pl-4">{t('playlist.titleCol')}</div>
            <div className="w-12 text-right mr-14">{t('playlist.timeCol')}</div>
        </div>
    );

    const renderEmptyState = () => (
        <div className="py-20 flex flex-col items-center justify-center text-[var(--text-secondary)] border-2 border-dashed border-[var(--glass-border)] rounded-3xl">
            <Music className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">{emptyMessage || t('playlist.empty')}</p>
            <p className="text-xs opacity-50">{emptyDescription || t('playlist.emptyDesc')}</p>
        </div>
    );

    return (
        <div className="space-y-3 pb-20">
            {showHeader && renderHeader()}

            {!songs || songs.length === 0 ? (
                renderEmptyState()
            ) : (
                songs.map((song) => (
                    <SongRow
                        key={song.id}
                        song={song}
                        onPlay={handlePlaySong}
                        extraAction={renderExtraAction ? renderExtraAction(song) : undefined}
                    />
                ))
            )}
        </div>
    );
};

export default SongList;
