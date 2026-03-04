import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Play, Pause, Info, Search, Music, LayoutGrid, ListMusic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SongRow, AlbumCard } from '../components';
import { Skeleton, ListSkeleton } from '../components/common/Skeleton';
import { ImmersiveHeader } from '../components/common/ImmersiveHeader';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useNeteaseArtistDetail, useNeteaseArtistSongs, useNeteaseArtistAlbums } from '../hooks/useNeteaseData';
import { useQQArtistDetail, useQQArtistSongs, useQQArtistAlbums } from '../hooks/useQQData';
import { useQishuiArtistDetail, useQishuiArtistSongs, useQishuiArtistAlbums } from '../hooks/useQishuiData';
import { songToTrack } from '../lib/trackUtils';
import { getPlatformAdapter } from '../lib/platform';
import type { Artist, Track, Album, MusicPlatform, Song } from '../types';

interface ArtistDetailViewProps {
    artistName?: string;
    artistId?: string | number;
    platform?: MusicPlatform;
    onBack: () => void;
    onNavigate?: (view: string) => void;
    // Old props compatibility
    id?: string;
}

const ArtistDetailView: React.FC<ArtistDetailViewProps> = (props) => {
    // Handle old prop 'id' for compatibility
    const artistId = props.artistId || props.id;
    const platform = props.platform || 'netease';

    if (platform === 'qq') {
        return <QQArtistContainer {...props} artistId={artistId} artistMid={String(artistId)} />;
    }
    if (platform === 'soda') {
        return <SodaArtistContainer {...props} artistId={artistId} />;
    }

    return <NeteaseArtistContainer {...props} artistId={artistId} />;
};

const NeteaseArtistContainer: React.FC<ArtistDetailViewProps> = (props) => {
    const artistId = props.artistId || props.id || '';
    const { artist: metadata, isLoading: isDetailLoading } = useNeteaseArtistDetail(artistId, { enabled: !!artistId });
    const { songs, isLoading: isSongsLoading } = useNeteaseArtistSongs(artistId, { enabled: !!artistId });
    const { albums, isLoading: isAlbumsLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useNeteaseArtistAlbums(artistId, { enabled: !!artistId });

    return (
        <ArtistDetailContent
            {...props}
            artistName={props.artistName || metadata?.name || ''}
            metadata={metadata}
            songs={songs || []}
            albums={albums || []}
            isLoading={{ detail: isDetailLoading, songs: isSongsLoading, albums: isAlbumsLoading }}
            pagination={{ hasNextPage: !!hasNextPage, isFetchingNextPage: !!isFetchingNextPage, fetchNextPage }}
        />
    );
};

const QQArtistContainer: React.FC<ArtistDetailViewProps & { artistMid: string }> = (props) => {
    const { artistMid } = props;
    const { artist: metadata, isLoading: isDetailLoading } = useQQArtistDetail(artistMid, { enabled: !!artistMid });
    const { songs, isLoading: isSongsLoading } = useQQArtistSongs(artistMid, { enabled: !!artistMid });
    const { albums, isLoading: isAlbumsLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useQQArtistAlbums(artistMid, { enabled: !!artistMid });

    return (
        <ArtistDetailContent
            {...props}
            artistName={props.artistName || metadata?.name || ''}
            metadata={metadata}
            songs={songs || []}
            albums={albums || []}
            isLoading={{ detail: isDetailLoading, songs: isSongsLoading, albums: isAlbumsLoading }}
            pagination={{ hasNextPage: !!hasNextPage, isFetchingNextPage: !!isFetchingNextPage, fetchNextPage: () => fetchNextPage?.() }}
        />
    );
};

const SodaArtistContainer: React.FC<ArtistDetailViewProps> = (props) => {
    const artistId = String(props.artistId || props.id || '');
    const { artist: metadata, isLoading: isDetailLoading } = useQishuiArtistDetail(artistId, { enabled: !!artistId });
    const { songs, isLoading: isSongsLoading } = useQishuiArtistSongs(artistId, { enabled: !!artistId });
    const { albums, isLoading: isAlbumsLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useQishuiArtistAlbums(artistId, { enabled: !!artistId });

    return (
        <ArtistDetailContent
            {...props}
            artistName={props.artistName || metadata?.name || ''}
            metadata={metadata}
            songs={songs || []}
            albums={albums || []}
            isLoading={{ detail: isDetailLoading, songs: isSongsLoading, albums: isAlbumsLoading }}
            pagination={{ hasNextPage: !!hasNextPage, isFetchingNextPage: !!isFetchingNextPage, fetchNextPage: () => fetchNextPage?.() }}
        />
    );
};

interface ContentProps extends ArtistDetailViewProps {
    metadata: Partial<Artist> | null | undefined;
    songs: Song[];
    albums: Album[];
    isLoading: { detail: boolean; songs: boolean; albums: boolean };
    pagination: { hasNextPage: boolean; isFetchingNextPage: boolean; fetchNextPage: () => void };
}

const ArtistDetailContent: React.FC<ContentProps> = ({
    artistName,
    platform = 'netease',
    onNavigate,
    metadata,
    songs,
    albums,
    isLoading,
    pagination
}) => {
    const { t } = useTranslation();
    const { setTrack, play, pause, isPlaying, currentTrack, setQueue } = usePlayerStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums' | 'about'>('all');

    // Infinite Scroll Logic
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = pagination;

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage) return;

        // Find the actual scroll container (.main-scroller) as IntersectionObserver root
        const scrollContainer = loadMoreRef.current?.closest('.main-scroller') as HTMLElement | null;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: '300px', root: scrollContainer }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Construct artist object
    const artistData: Artist = useMemo(() => {
        return {
            id: metadata?.id || 0,
            name: artistName || metadata?.name || '',
            platform,
            avatar: metadata?.avatar || '',
            bio: metadata?.bio || t('artist.about'),
            genres: ['Pop', 'R&B', 'Electronic', 'Acoustic'],
            popularSongs: songs,
            albums: albums,
            songCount: metadata?.songCount || 0,
            albumCount: metadata?.albumCount || 0,
        };
    }, [artistName, metadata, songs, albums, t, platform]);

    // Filtering logic
    const filteredSongs = useMemo(() => {
        const list = songs || [];
        if (!searchQuery) {
            // In 'all' tab, show only top 10 popular songs; in 'songs' tab show more
            return activeTab === 'all' ? list.slice(0, 10) : list;
        }
        return list.filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.album.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [songs, searchQuery, activeTab]);

    const filteredAlbums = useMemo(() => {
        const list = albums || [];
        if (!searchQuery) return list;
        return list.filter(a =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [albums, searchQuery]);

    const handlePlayAll = () => {
        if (filteredSongs.length > 0) {
            const tracks: Track[] = filteredSongs.map(song => songToTrack(song));

            setQueue(tracks);
            setTrack(tracks[0]);
            play();
        }
    };

    const handleTogglePlay = () => {
        if (isPlaying && currentTrack?.artist === artistName) {
            pause();
        } else {
            handlePlayAll();
        }
    };

    return (
        <div className="animate-fade-in pb-40 relative">
            <ImmersiveHeader backgroundImage={(artistData.avatar && artistData.avatar.startsWith('http')) ? artistData.avatar : artistData.albums?.[0]?.cover}>
                <div className="absolute bottom-24 left-16 md:left-24 right-16 flex flex-col md:flex-row items-end gap-16 z-10">
                    <div className="relative w-56 h-56 md:w-64 md:h-64 flex-shrink-0 z-20">
                        <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border-4 border-white/20 transition-transform duration-700 group-hover:scale-105 bg-[var(--glass-highlight)]">
                            {isLoading.detail ? (
                                <Skeleton className="w-full h-full rounded-full" />
                            ) : artistData.avatar && artistData.avatar.startsWith('http') ? (
                                <img src={artistData.avatar} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" alt={artistName} />
                            ) : artistData.albums?.[0] ? (
                                <img src={artistData.albums[0].cover} className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-110" alt={artistName} />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[var(--accent-color)]/20 to-indigo-500/20 flex items-center justify-center">
                                    <Music className="w-24 h-24 text-white/20" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-start animate-slide-up pb-2">
                        {isLoading.detail ? (
                            <>
                                <Skeleton className="h-16 w-3/4 mb-10 rounded-xl" />
                                <div className="flex gap-10 mt-2">
                                    <Skeleton className="h-10 w-32 rounded-full" />
                                    <Skeleton className="h-10 w-48 rounded-full" />
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="text-6xl md:text-8xl font-black mb-10 text-[var(--text-main)] tracking-tighter leading-[0.85] drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                                    {artistName}
                                </h1>

                                <div className="flex items-center flex-wrap gap-x-10 gap-y-6">
                                    <button
                                        onClick={handleTogglePlay}
                                        className="flex items-center gap-3 px-10 py-4 bg-[var(--accent-color)] text-white rounded-full font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--accent-color)]/20"
                                    >
                                        {isPlaying && currentTrack?.artist === artistName ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                                        {t('album.playAll')}
                                    </button>

                                    <div className="flex items-center gap-8 text-sm font-extrabold text-[var(--text-secondary)]">
                                        <div className="flex items-center gap-3">
                                            <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" />
                                            <span className="text-2xl font-black text-[var(--text-main)]">{artistData.songCount || 0}</span>
                                            <span className="uppercase tracking-widest text-[10px] opacity-60">{t('library.tabs.songs')}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" />
                                            <span className="text-2xl font-black text-[var(--text-main)]">{artistData.albumCount || 0}</span>
                                            <span className="uppercase tracking-widest text-[10px] opacity-60">{t('library.tabs.albums')}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </ImmersiveHeader>

            <main className="w-full px-8">
                {/* Search & Navigation Bar */}
                <div className="flex items-center justify-between mb-12 pb-6 border-b border-[var(--glass-border)]">
                    <div className="flex gap-2">
                        {(['all', 'songs', 'albums', 'about'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === tab
                                    ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20 scale-105'
                                    : 'bg-[var(--glass-highlight)] text-[var(--text-secondary)] hover:bg-[var(--glass-border)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                {tab === 'all' ? t('common.viewAll') : (tab === 'about' ? t('artist.about') : t(`library.tabs.${tab}`))}
                            </button>
                        ))}
                    </div>

                    <div className="relative group/search max-w-sm w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within/search:text-[var(--accent-color)] transition-colors" />
                        <input
                            type="text"
                            placeholder={t('artist.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-12 pr-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="space-y-24">
                    {/* 1. Popular Tracks - Clean List */}
                    {(activeTab === 'all' || activeTab === 'songs') && (
                        <section className="animate-fade-in w-full">
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-4 text-[var(--text-main)] tracking-tight">
                                <ListMusic className="w-6 h-6 text-[var(--accent-color)]" />
                                {searchQuery ? t('home.searchResultsFor') : t('artist.popularTracks')}
                            </h2>
                            <div className="space-y-4">
                                {isLoading.songs ? (
                                    <ListSkeleton rows={5} />
                                ) : (
                                    filteredSongs.map((song) => (
                                        <div key={song.id} className="group relative">
                                            <SongRow song={song} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    )}

                    {/* 2. All Albums - Pure Grid */}
                    {(activeTab === 'all' || activeTab === 'albums') && (
                        <section className="animate-fade-in w-full">
                            <h2 className="text-xl font-bold mb-10 flex items-center gap-4 text-[var(--text-main)] tracking-tight">
                                <LayoutGrid className="w-6 h-6 text-[var(--accent-color)]" />
                                {t('artist.albums')}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16">
                                {isLoading.albums ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="space-y-3">
                                            <Skeleton className="w-full aspect-square rounded-2xl" />
                                            <Skeleton className="w-3/4 h-4 rounded" />
                                            <Skeleton className="w-1/2 h-3 rounded" />
                                        </div>
                                    ))
                                ) : (
                                    filteredAlbums.map((album: Album) => (
                                        <AlbumCard
                                            key={album.id}
                                            album={album}
                                            onClick={() => {
                                                if (onNavigate) {
                                                    const adapter = getPlatformAdapter(album.platform);
                                                    onNavigate(adapter.getAlbumPath(album.id));
                                                }
                                            }}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Infinite Scroll Sentinel */}
                            {pagination.hasNextPage && (
                                <div ref={loadMoreRef} className="mt-16 py-10 flex justify-center">
                                    {pagination.isFetchingNextPage && (
                                        <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                                            <div className="w-5 h-5 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                                                {t('common.loading')}...
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {/* 3. About Section */}
                    {(activeTab === 'all' || activeTab === 'about') && (
                        <section className="animate-fade-in w-full pt-8">
                            <h2 className="text-xl font-bold mb-10 flex items-center gap-4 text-[var(--text-main)] tracking-tight">
                                <Info className="w-6 h-6 text-[var(--accent-color)]" />
                                {t('artist.about')}
                            </h2>

                            <div className="relative pl-12 border-l-2 border-[var(--accent-color)]/20 ml-2">
                                <div className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed opacity-90 mb-10 max-w-4xl whitespace-pre-wrap">
                                    {artistData.bio}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ArtistDetailView;
