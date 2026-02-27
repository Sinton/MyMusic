import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlaylistCard, AlbumCard } from '../components';
import { Skeleton } from '../components/common/Skeleton';
import { useNeteaseUserPlaylists, useNeteaseNewestAlbums } from '../hooks/useNeteaseData';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import type { Playlist, Album } from '../types';

interface LibraryViewProps {
    initialTab?: 'Songs' | 'Playlists' | 'Albums';
    onNavigate?: (view: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ initialTab = 'Songs', onNavigate }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'Songs' | 'Playlists' | 'Albums'>(initialTab);

    // Real Netease Hook for fetching Library items
    const user = useNeteaseStore(state => state.user);
    const isLoggedIn = useNeteaseStore(state => state.isLoggedIn);

    // Fallback: If not logged in, these won't fetch much or will return empty arrays if properly guarded
    const { playlists: remotePlaylists, isLoading: isPlaylistsLoading } = useNeteaseUserPlaylists(user?.userId || 0, {
        enabled: activeTab === 'Playlists' && isLoggedIn
    });

    // Albums -> Using Netease newest albums purely as a placeholder instead of local mocks since real library albums need further APIs
    const { albums, isLoading: isAlbumsLoading } = useNeteaseNewestAlbums({ enabled: activeTab === 'Albums' });

    const { userPlaylists } = usePlaylistStore();

    // Deduplicate lists between local created and remote
    const playlists: Playlist[] = [...userPlaylists, ...remotePlaylists.filter(mp => !userPlaylists.some((up: Playlist) => up.id === mp.id))];

    const handlePlayCollection = () => {
        // Safe fallback action if clicking empty playlist or local list without navigating
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
                    {!isLoggedIn ? (
                        <div className="py-20 text-center text-[var(--text-muted)] border border-dashed border-[var(--glass-border)] rounded-2xl">
                            {t('auth.pleaseLogin', '请先登录以查看您的音乐库')}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-[var(--text-muted)] border border-dashed border-[var(--glass-border)] rounded-2xl">
                            暂未实现获取喜欢的音乐 (TODO)
                        </div>
                    )}
                </div>
            )}

            {/* Playlists Tab */}
            {activeTab === 'Playlists' && (
                <div className="grid grid-cols-3 gap-6 animate-fade-in">
                    {isPlaylistsLoading ? (
                        Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="w-full aspect-square rounded-2xl" />
                                <Skeleton className="w-3/4 h-4 rounded" />
                                <Skeleton className="w-1/2 h-3 rounded" />
                            </div>
                        ))
                    ) : (
                        playlists.map((pl: Playlist) => (
                            <PlaylistCard
                                key={pl.id}
                                playlist={pl}
                                onClick={() => {
                                    if (typeof pl.id === 'number' && pl.id >= 100 && onNavigate) {
                                        onNavigate(`Playlist:${pl.id}`);
                                    } else {
                                        handlePlayCollection();
                                    }
                                }}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Albums Tab */}
            {activeTab === 'Albums' && (
                <div className="grid grid-cols-4 gap-6 animate-fade-in">
                    {isAlbumsLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="w-full aspect-square rounded-2xl" />
                                <Skeleton className="w-3/4 h-4 rounded" />
                                <Skeleton className="w-1/2 h-3 rounded" />
                            </div>
                        ))
                    ) : (
                        albums.map((album: Album) => (
                            <AlbumCard
                                key={album.id}
                                album={album}
                                onClick={() => onNavigate && onNavigate(`Album:${album.id}`)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default LibraryView;
