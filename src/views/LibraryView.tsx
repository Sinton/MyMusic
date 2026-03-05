import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { useQQStore } from '../stores/useQQStore';
import { useNeteaseNewestAlbums } from '../hooks/netease';
import { LibrarySongsTab } from './library/LibrarySongsTab';
import { LibraryPlaylistsTab } from './library/LibraryPlaylistsTab';
import { LibraryAlbumsTab } from './library/LibraryAlbumsTab';

interface LibraryViewProps {
    initialTab?: 'Songs' | 'Playlists' | 'Albums';
    onNavigate?: (view: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ initialTab = 'Songs', onNavigate }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'Songs' | 'Playlists' | 'Albums'>(initialTab);

    // NetEase Store & Data
    const isLoggedInNetease = useNeteaseStore((state) => state.isLoggedIn);
    const isLoggedInQQ = useQQStore((state) => state.isLoggedIn);

    const { albums, isLoading: isAlbumsLoading } = useNeteaseNewestAlbums({ enabled: activeTab === 'Albums' });

    return (
        <div className="relative min-h-full">
            {/* Header Title */}
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

            {/* Content Area */}
            <div className="animate-fade-in pb-20">
                {activeTab === 'Songs' && (
                    <LibrarySongsTab
                        isLoggedInNetease={isLoggedInNetease}
                        isLoggedInQQ={isLoggedInQQ}
                    />
                )}

                {activeTab === 'Playlists' && (
                    <LibraryPlaylistsTab onNavigate={onNavigate} />
                )}

                {activeTab === 'Albums' && (
                    <LibraryAlbumsTab
                        albums={albums || []}
                        isLoading={isAlbumsLoading}
                        onNavigate={onNavigate}
                    />
                )}
            </div>
        </div>
    );
};

export default LibraryView;
