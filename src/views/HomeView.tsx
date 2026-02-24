import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, Loader2, Cloud, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PlaylistCard, SongRow } from '../components';
import { Skeleton } from '../components/common/Skeleton';
import { usePlaylists, useSongs } from '../hooks/useData';
import { useNeteaseSearch, useNeteasePersonalized, useNeteaseNewestAlbums, useNeteaseToplist } from '../hooks/useNeteaseData';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { Playlist, Track, Album } from '../types';

interface HomeViewProps {
    onNavigate?: (view: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const { playlists, isLoading: isPlaylistsLoading } = usePlaylists();
    const { songs } = useSongs();
    const { setTrack, play } = usePlayerStore();

    // NetEase state
    // Use activeQuery instead of debouncedQuery for search triggering
    const [activeQuery, setActiveQuery] = useState('');

    const { songs: neteaseResults, isLoading: isNeteaseSearching } = useNeteaseSearch(activeQuery, {
        enabled: !!activeQuery.trim(),
    });

    // Feature 1: Personalized Playlists (Made For You)
    const { playlists: personalizedPlaylists, isLoading: isPersonalizedLoading } = useNeteasePersonalized();

    // Feature 2: Newest Albums
    const { albums: newestAlbums, isLoading: isNewestAlbumsLoading } = useNeteaseNewestAlbums();

    // Feature 3: Toplists (Charts)
    const { playlists: toplists, isLoading: isToplistLoading } = useNeteaseToplist();

    // Remove debounce effect and local search merging logic if we are committed to NetEase primarily,
    // but preserving local search merging for now as it doesn't hurt.

    const localResults = useMemo(() => {
        if (!activeQuery.trim()) return [];
        const query = activeQuery.toLowerCase();
        return songs.filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query) ||
            song.album.toLowerCase().includes(query)
        );
    }, [activeQuery, songs]);

    // Merge: local first, then NetEase (deduplicated by title+artist)
    const mergedResults = useMemo(() => {
        if (!activeQuery.trim()) return [];
        const seen = new Set(localResults.map(s => `${s.title}::${s.artist}`.toLowerCase()));
        const uniqueNetease = neteaseResults.filter(
            s => !seen.has(`${s.title}::${s.artist}`.toLowerCase())
        );
        return [...localResults, ...uniqueNetease];
    }, [activeQuery, localResults, neteaseResults]);

    const handlePlayPlaylist = useCallback((_playlist: Playlist) => {
        if (songs.length > 0) {
            const randomSong = songs[Math.floor(Math.random() * songs.length)];
            const track: Track = {
                id: randomSong.id,
                title: randomSong.title,
                artist: randomSong.artist,
                artistId: randomSong.artistId,
                album: randomSong.album,
                albumId: randomSong.albumId,
                duration: randomSong.duration,
                currentTime: '0:00',
                source: randomSong.bestSource,
                quality: randomSong.sources[0]?.qualityLabel || 'Hi-Res Lossless',
                cover: randomSong.cover,
            };
            setTrack(track);
            play();
        }
    }, [songs, setTrack, play]);

    const isSearching = isNeteaseSearching && !!activeQuery.trim();

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Search Bar */}
            <section className="mb-12 pt-4 pb-4">
                <div className="relative max-w-2xl mx-auto">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeQuery ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setActiveQuery(searchQuery);
                            }
                        }}
                        placeholder={t('home.searchPlaceholder')}
                        className="w-full bg-[var(--glass-highlight)] border border-[var(--glass-border)] text-[var(--text-main)] rounded-2xl py-4 pl-12 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:bg-[var(--glass-bg)] placeholder-[var(--text-muted)] transition-all shadow-2xl"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setActiveQuery('');
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </section>

            {activeQuery ? (
                /* Search Results View */
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold italic">
                            {t('home.searchResultsFor')} "{searchQuery}"
                        </h2>
                        <div className="flex items-center gap-3">
                            {isSearching && (
                                <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                            )}
                            <span className="text-sm text-[var(--text-muted)]">{mergedResults.length} {t('home.resultsFound')}</span>
                        </div>
                    </div>

                    {mergedResults.length > 0 ? (
                        <div className="space-y-2">
                            {mergedResults.map(song => (
                                <SongRow key={`${song.id}-${song.bestSource}`} song={song} />
                            ))}
                        </div>
                    ) : isSearching ? (
                        <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)] space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin opacity-30" />
                            <p className="text-lg">{t('home.searching', '搜索中...')}</p>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)] space-y-4">
                            <Search className="w-16 h-16 opacity-20" />
                            <p className="text-lg">{t('home.noResults')}</p>
                        </div>
                    )}
                </section>
            ) : (
                /* Default Home View */
                <>
                    {/* SECTION 1: Personalized Playlists (Made For You) */}
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <Cloud className="w-5 h-5 text-red-500" />
                            <h2 className="text-xl font-bold text-[var(--text-main)]">{t('home.neteaseRecommend', '网易云推荐')}</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {isPersonalizedLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="w-full aspect-square rounded-2xl bg-white/5" />
                                        <Skeleton className="h-4 w-3/4 bg-white/5 rounded" />
                                        <Skeleton className="h-3 w-1/2 bg-white/5 rounded" />
                                    </div>
                                ))
                            ) : (
                                personalizedPlaylists.slice(0, 8).map((pl) => (
                                    <div
                                        key={pl.id}
                                        className="group p-4 rounded-2xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-all cursor-pointer"
                                        onClick={() => onNavigate?.(`Playlist:${pl.id}`)}
                                    >
                                        <div className="w-full aspect-square rounded-xl shadow-lg mb-4 overflow-hidden relative">
                                            {pl.cover ? (
                                                <img src={pl.cover} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-red-500/30 to-pink-500/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                                    <Music className="w-12 h-12 text-[var(--text-muted)]" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-[var(--text-main)] truncate">{pl.title}</h3>
                                        <p className="text-sm text-[var(--text-secondary)] truncate">{pl.count} {t('home.tracks', '首')}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* SECTION 2: Newest Albums */}
                    <section className="mb-12">
                        <h2 className="text-xl font-bold mb-6 text-[var(--text-main)]">{t('home.newestAlbums', '新碟上架')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {isNewestAlbumsLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="w-full aspect-square rounded-2xl bg-white/5" />
                                        <Skeleton className="h-4 w-3/4 bg-white/5 rounded" />
                                    </div>
                                ))
                            ) : (
                                newestAlbums.slice(0, 10).map((album: Album) => (
                                    <div
                                        key={album.id}
                                        className="group p-3 rounded-2xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-all cursor-pointer"
                                        onClick={() => onNavigate?.(`Album:${album.id}`)}
                                    >
                                        <div className="w-full aspect-square rounded-xl shadow-lg mb-3 overflow-hidden relative">
                                            <img src={album.cover} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <h3 className="font-bold text-[var(--text-main)] truncate text-sm">{album.title}</h3>
                                        <p className="text-xs text-[var(--text-secondary)] truncate">{album.artist}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* SECTION 3: Toplists (Charts) */}
                    <section className="mb-12">
                        <h2 className="text-xl font-bold mb-6 text-[var(--text-main)]">{t('home.charts', '排行榜')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {isToplistLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="w-full h-32 rounded-2xl bg-white/5" />
                                ))
                            ) : (
                                toplists.slice(0, 4).map((pl) => (
                                    <div
                                        key={pl.id}
                                        onClick={() => onNavigate?.(`Playlist:${pl.id}`)}
                                        className="relative h-32 rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform"
                                    >
                                        <img src={pl.cover} alt={pl.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                                            <h3 className="font-bold text-white text-lg">{pl.title}</h3>
                                            <p className="text-white/60 text-xs">{pl.count} {t('home.tracks', '首')}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Quick Access to Library */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--text-secondary)]">{t('home.recentlyPlayed')}</h2>
                            <button
                                onClick={() => onNavigate?.('Playlists')}
                                className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            >
                                {t('home.seeAll')}
                            </button>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2 hide-scrollbar">
                            {isPlaylistsLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="shrink-0 w-48 h-16 rounded-xl" />
                                ))
                            ) : (
                                playlists.map((pl: Playlist) => (
                                    <PlaylistCard
                                        key={pl.id}
                                        playlist={pl}
                                        variant="compact"
                                        onClick={() => handlePlayPlaylist(pl)}
                                    />
                                ))
                            )}
                        </div>
                    </section>

                    {/* Jump Back In */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 text-[var(--text-secondary)]">{t('home.jumpBackIn')}</h2>
                        <div className="grid grid-cols-6 gap-6">
                            {isPlaylistsLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="w-full aspect-square rounded-xl" />
                                        <Skeleton className="w-3/4 h-3 rounded" />
                                    </div>
                                ))
                            ) : (
                                playlists.slice(0, 6).map((pl: Playlist) => (
                                    <div
                                        key={pl.id}
                                        className="group cursor-pointer"
                                        onClick={() => handlePlayPlaylist(pl)}
                                    >
                                        <div className={`w-full aspect-square ${pl.cover} rounded-xl mb-3 hover:scale-105 transition-transform shadow-lg shadow-black/20`}></div>
                                        <div className="font-medium text-sm truncate text-[var(--text-main)]">{pl.title}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{t('sidebar.playlists')}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default HomeView;
