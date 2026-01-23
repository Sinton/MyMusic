import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SongRow, PlaylistCard, AlbumCard } from '../components';
import { useSongs, usePlaylists, useAlbums } from '../hooks/useData';
import { usePlayerStore } from '../stores/usePlayerStore';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import type { Playlist, Album } from '../types';

interface LibraryViewProps {
    initialTab?: 'Songs' | 'Playlists' | 'Albums';
    onNavigate?: (view: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ initialTab = 'Songs', onNavigate }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'Songs' | 'Playlists' | 'Albums'>(initialTab);

    const { songs } = useSongs();
    const { playlists: mockPlaylists } = usePlaylists();
    const { userPlaylists } = usePlaylistStore();
    const { albums } = useAlbums();
    const { setTrack, play } = usePlayerStore();

    const playlists: Playlist[] = [...userPlaylists, ...mockPlaylists.filter(mp => !userPlaylists.some((up: Playlist) => up.id === mp.id))];

    const handlePlayCollection = () => {
        if (songs.length > 0) {
            const randomSong = songs[Math.floor(Math.random() * songs.length)];
            const track: any = {
                id: randomSong.id,
                title: randomSong.title,
                artist: randomSong.artist,
                album: randomSong.album,
                duration: randomSong.duration,
                currentTime: '0:00',
                source: randomSong.bestSource,
                quality: randomSong.sources[0]?.qualityLabel || 'Hi-Res Lossless',
            };
            setTrack(track);
            play();
        }
    };

    return (
        <div className="relative min-h-full">
            {/* Header Title (Scrolls away) */}
            <div className="mb-4 pt-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-main)] to-[var(--text-secondary)]">
                    {t('library.title')}
                </h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">{t('library.subtitle')}</p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center justify-between mb-6 border-b border-[var(--glass-border)] pb-4">
                <div className="flex gap-2">
                    {(['Songs', 'Playlists', 'Albums'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === tab
                                ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20 scale-105'
                                : 'bg-[var(--glass-highlight)] text-[var(--text-secondary)] hover:bg-[var(--glass-border)] hover:text-[var(--text-main)]'
                                }`}
                        >
                            {t(`library.tabs.${tab.toLowerCase()}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Songs Tab */}
            {activeTab === 'Songs' && (
                <div className="space-y-4 animate-fade-in">
                    {songs.map((song) => (
                        <SongRow key={song.id} song={song} />
                    ))}
                </div>
            )}

            {/* Playlists Tab */}
            {activeTab === 'Playlists' && (
                <div className="grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {playlists.map((pl: Playlist) => (
                        <PlaylistCard
                            key={pl.id}
                            playlist={pl}
                            onClick={() => {
                                if (pl.id >= 100 && onNavigate) {
                                    onNavigate(`Playlist:${pl.id}`);
                                } else {
                                    handlePlayCollection();
                                }
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Albums Tab */}
            {activeTab === 'Albums' && (
                <div className="grid grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {albums.map((album: Album) => (
                        <AlbumCard
                            key={album.id}
                            album={album}
                            onClick={() => handlePlayCollection()}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LibraryView;
