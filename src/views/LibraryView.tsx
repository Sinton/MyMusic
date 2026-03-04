import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PlaylistCard, AlbumCard, PlatformBadge } from '../components';
import { Skeleton } from '../components/common/Skeleton';
import { useNeteaseUserPlaylists, useNeteaseNewestAlbums } from '../hooks/useNeteaseData';
import { useQQUserPlaylists } from '../hooks/useQQData';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { useQQStore } from '../stores/useQQStore';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import type { Playlist, Album } from '../types';

interface LibraryViewProps {
    initialTab?: 'Songs' | 'Playlists' | 'Albums';
    onNavigate?: (view: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ initialTab = 'Songs', onNavigate }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'Songs' | 'Playlists' | 'Albums'>(initialTab);

    // Collapsible states
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        vibe: true,
        netease: true,
        qq: true,
    });

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // NetEase Store & Data
    const neteaseUser = useNeteaseStore(state => state.user);
    const isLoggedInNetease = useNeteaseStore(state => state.isLoggedIn);
    const { playlists: neteaseRemotePlaylists, isLoading: isNeteaseLoading, isError: _isNeteaseError, refetch: _refetchNetease } = useNeteaseUserPlaylists(neteaseUser?.userId || 0, {
        enabled: activeTab === 'Playlists' && isLoggedInNetease
    });

    // QQ Store & Data
    const isLoggedInQQ = useQQStore(state => state.isLoggedIn);
    const { playlists: qqRemotePlaylists, isLoading: isQQLoading, isError: _isQQError, refetch: _refetchQQ } = useQQUserPlaylists({
        enabled: activeTab === 'Playlists' && isLoggedInQQ
    });

    const { albums, isLoading: isAlbumsLoading, isError: _isAlbumsError, refetch: _refetchAlbums } = useNeteaseNewestAlbums({ enabled: activeTab === 'Albums' });

    const { userPlaylists } = usePlaylistStore();

    // Grouping NetEase Playlists
    const neteaseLikedPlaylist = neteaseRemotePlaylists.length > 0 ? neteaseRemotePlaylists[0] : null;
    const neteaseOtherPlaylists = neteaseRemotePlaylists.slice(1);
    const neteaseCreatedPlaylists = neteaseOtherPlaylists.filter((p: Playlist) => !p.isSubscribed);
    const neteaseCollectedPlaylists = neteaseOtherPlaylists.filter((p: Playlist) => p.isSubscribed);

    // Grouping QQ Playlists
    const qqCreatedPlaylists = qqRemotePlaylists.filter((p: Playlist) => !p.isSubscribed);
    const qqCollectedPlaylists = qqRemotePlaylists.filter((p: Playlist) => p.isSubscribed);

    const isPlaylistsLoading = isNeteaseLoading || isQQLoading;

    // Section Header Helper
    const renderSectionHeader = (id: string, title: string, count?: number, color?: string, icon?: React.ReactNode, isSubSection = false) => {
        const isExpanded = expandedSections[id];

        // Static header for sub-sections (no folding)
        if (isSubSection) {
            return (
                <div className="flex items-center gap-3 mb-4 mt-6 px-1">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: color || 'var(--accent-color)' }}></div>
                    <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2 opacity-90">
                        {title}
                        {count !== undefined && (
                            <span className="text-sm font-medium text-[var(--text-muted)] opacity-60">({count})</span>
                        )}
                    </h3>
                </div>
            );
        }

        return (
            <div
                onClick={() => toggleSection(id)}
                className="flex items-center justify-between group cursor-pointer hover:bg-[var(--glass-highlight)] px-3 py-2 -mx-3 rounded-xl transition-all mb-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: color || 'var(--accent-color)' }}></div>
                    {icon && <div className="scale-90 -mx-0.5">{icon}</div>}
                    <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                        {title}
                        {count !== undefined && (
                            <span className="text-sm font-medium text-[var(--text-muted)] opacity-60">({count})</span>
                        )}
                    </h2>
                </div>
                <div className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
            </div>
        );
    };

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
                    <div className="space-y-4">
                        {(!isLoggedInNetease && !isLoggedInQQ) ? (
                            <div className="py-20 text-center text-[var(--text-muted)] border border-dashed border-[var(--glass-border)] rounded-2xl">
                                {t('auth.pleaseLogin', '请先登录以查看您的音乐库')}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-[var(--text-muted)] border border-dashed border-[var(--glass-border)] rounded-2xl">
                                {t('library.noLikedSongs')}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Playlists' && (
                    <div className="space-y-6">
                        {isPlaylistsLoading ? (
                            <div className="grid grid-cols-4 gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="w-full aspect-square rounded-2xl" />
                                        <Skeleton className="w-3/4 h-4 rounded" />
                                        <Skeleton className="w-1/2 h-3 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* Vibe Section */}
                                {userPlaylists.length > 0 && (
                                    <section>
                                        {renderSectionHeader(
                                            'vibe',
                                            t('library.sections.local', '本地'),
                                            userPlaylists.length,
                                            undefined,
                                            <PlatformBadge name="Vibe" color="var(--accent-color)" size="md" />
                                        )}
                                        {expandedSections.vibe && (
                                            <div className="grid grid-cols-4 gap-6 animate-slide-up mt-2">
                                                {userPlaylists.map((pl: Playlist) => (
                                                    <PlaylistCard
                                                        key={pl.id}
                                                        playlist={pl}
                                                        onClick={() => pl.id && onNavigate && onNavigate(`Playlist:${pl.id}`)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                )}

                                {/* NetEase Platform Section */}
                                {isLoggedInNetease && (
                                    <section className={`${userPlaylists.length > 0 ? 'pt-4 border-t border-[var(--glass-border)]' : ''}`}>
                                        {renderSectionHeader(
                                            'netease',
                                            t('library.sections.netease'),
                                            neteaseRemotePlaylists.length,
                                            '#e60026',
                                            <PlatformBadge name="NetEase" color="#e60026" size="md" />
                                        )}

                                        {expandedSections.netease && (
                                            <div className="pl-4 space-y-4 animate-slide-up">
                                                {/* Liked */}
                                                {neteaseLikedPlaylist && (
                                                    <section>
                                                        {renderSectionHeader(
                                                            '',
                                                            t('library.sections.neteaseLiked', '我喜欢的音乐'),
                                                            undefined,
                                                            '#e60026',
                                                            undefined,
                                                            true
                                                        )}
                                                        <div className="grid grid-cols-4 gap-6 px-1">
                                                            <PlaylistCard
                                                                playlist={neteaseLikedPlaylist}
                                                                onClick={() => neteaseLikedPlaylist.id && onNavigate && onNavigate(`Playlist:${neteaseLikedPlaylist.id}`)}
                                                            />
                                                        </div>
                                                    </section>
                                                )}

                                                {/* Created */}
                                                {neteaseCreatedPlaylists.length > 0 && (
                                                    <section>
                                                        {renderSectionHeader(
                                                            '',
                                                            t('library.sections.neteaseCreated', '创建的歌单'),
                                                            neteaseCreatedPlaylists.length,
                                                            '#e60026',
                                                            undefined,
                                                            true
                                                        )}
                                                        <div className="grid grid-cols-4 gap-6 px-1">
                                                            {neteaseCreatedPlaylists.map((pl: Playlist) => (
                                                                <PlaylistCard
                                                                    key={pl.id}
                                                                    playlist={pl}
                                                                    onClick={() => pl.id && onNavigate && onNavigate(`Playlist:${pl.id}`)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </section>
                                                )}

                                                {/* Collected */}
                                                {neteaseCollectedPlaylists.length > 0 && (
                                                    <section>
                                                        {renderSectionHeader(
                                                            '',
                                                            t('library.sections.neteaseCollected', '收藏的歌单'),
                                                            neteaseCollectedPlaylists.length,
                                                            '#e60026',
                                                            undefined,
                                                            true
                                                        )}
                                                        <div className="grid grid-cols-4 gap-6 px-1">
                                                            {neteaseCollectedPlaylists.map((pl: Playlist) => (
                                                                <PlaylistCard
                                                                    key={pl.id}
                                                                    playlist={pl}
                                                                    onClick={() => pl.id && onNavigate && onNavigate(`Playlist:${pl.id}`)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </section>
                                                )}
                                            </div>
                                        )}
                                    </section>
                                )}

                                {/* QQ Music Platform Section */}
                                {isLoggedInQQ && (
                                    <section className={`${(userPlaylists.length > 0 || isLoggedInNetease) ? 'pt-4 border-t border-[var(--glass-border)]' : ''}`}>
                                        {renderSectionHeader(
                                            'qq',
                                            t('library.sections.qq'),
                                            qqRemotePlaylists.length,
                                            '#31c27c',
                                            <PlatformBadge name="QQ Music" color="#31c27c" size="md" />
                                        )}

                                        {expandedSections.qq && (
                                            <div className="pl-4 space-y-4 animate-slide-up">
                                                {/* Created */}
                                                {qqCreatedPlaylists.length > 0 && (
                                                    <section>
                                                        {renderSectionHeader(
                                                            '',
                                                            t('library.sections.qqCreated', '创建的歌单'),
                                                            qqCreatedPlaylists.length,
                                                            '#31c27c',
                                                            undefined,
                                                            true
                                                        )}
                                                        <div className="grid grid-cols-4 gap-6 px-1">
                                                            {qqCreatedPlaylists.map((pl: Playlist) => (
                                                                <PlaylistCard
                                                                    key={pl.id}
                                                                    playlist={pl}
                                                                    onClick={() => pl.id && onNavigate && onNavigate(`Playlist:${pl.id}`)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </section>
                                                )}

                                                {/* Collected */}
                                                {qqCollectedPlaylists.length > 0 && (
                                                    <section>
                                                        {renderSectionHeader(
                                                            '',
                                                            t('library.sections.qqCollected', '收藏的歌单'),
                                                            qqCollectedPlaylists.length,
                                                            '#31c27c',
                                                            undefined,
                                                            true
                                                        )}
                                                        <div className="grid grid-cols-4 gap-6 px-1">
                                                            {qqCollectedPlaylists.map((pl: Playlist) => (
                                                                <PlaylistCard
                                                                    key={pl.id}
                                                                    playlist={pl}
                                                                    onClick={() => pl.id && onNavigate && onNavigate(`Playlist:${pl.id}`)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </section>
                                                )}
                                            </div>
                                        )}
                                    </section>
                                )}

                                {!isLoggedInNetease && !isLoggedInQQ && !userPlaylists.length && (
                                    <div className="py-20 text-center text-[var(--text-muted)] bg-[var(--glass-highlight)] rounded-2xl border border-dashed border-[var(--glass-border)]">
                                        {t('library.empty')}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'Albums' && (
                    <div className="grid grid-cols-4 gap-6">
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
        </div>
    );
};

export default LibraryView;
