import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PlaylistCard, SongRow } from '../components';
import { Skeleton } from '../components/common/Skeleton';
import { usePlaylists, useSongs, useHomeSections } from '../hooks/useData';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { HomeCard, Playlist, Track } from '../types';

interface HomeViewProps {
    onNavigate?: (view: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const { playlists } = usePlaylists();
    const { songs } = useSongs();
    const { sections: homeSections, isLoading: isSectionsLoading } = useHomeSections();
    const { setTrack, play } = usePlayerStore();

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return songs.filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query) ||
            song.album.toLowerCase().includes(query)
        );
    }, [searchQuery, songs]);

    const handlePlayPlaylist = (_playlist: Playlist) => {
        // Select a random song to simulate playing the playlist
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
            };
            setTrack(track);
            play();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Search Bar */}
            <section className="mb-12 pt-4 pb-4">
                <div className="relative max-w-2xl mx-auto">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchQuery ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('home.searchPlaceholder')}
                        className="w-full bg-[var(--glass-highlight)] border border-[var(--glass-border)] text-[var(--text-main)] rounded-2xl py-4 pl-12 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:bg-[var(--glass-bg)] placeholder-[var(--text-muted)] transition-all shadow-2xl"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </section>

            {searchQuery ? (
                /* Search Results View */
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold italic">
                            {t('home.searchResultsFor')} "{searchQuery}"
                        </h2>
                        <span className="text-sm text-[var(--text-muted)]">{searchResults.length} {t('home.resultsFound')}</span>
                    </div>

                    {searchResults.length > 0 ? (
                        <div className="space-y-2">
                            {searchResults.map(song => (
                                <SongRow key={song.id} song={song} />
                            ))}
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
                    {/* Skeleton Loading State */}
                    {isSectionsLoading && (
                        <div className="space-y-12">
                            {[1, 2, 3].map((i) => (
                                <section key={`skeleton-${i}`}>
                                    <Skeleton className="h-8 w-48 mb-6 bg-white/5" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {[1, 2, 3, 4].map((j) => (
                                            <div key={j} className="space-y-3">
                                                <Skeleton className="w-full aspect-square rounded-2xl bg-white/5" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-3/4 bg-white/5 rounded" />
                                                    <Skeleton className="h-3 w-1/2 bg-white/5 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}

                    {/* Dynamic Home Sections */}
                    {homeSections.map((section) => (
                        <section key={section.title} className="mb-12">
                            <h2 className="text-xl font-bold mb-6 text-[var(--text-main)]">{t(section.title)}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {section.cards.map((card) => (
                                    <div
                                        key={`${card.type}-${card.id}`}
                                        onClick={() => {
                                            if (card.type === 'playlist') onNavigate?.(`Playlist:${card.id}`);
                                            else if (card.type === 'album') onNavigate?.(`Album:${card.id}`);
                                            // Handle song click if needed
                                        }}
                                        className="group p-4 rounded-2xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-all cursor-pointer"
                                    >
                                        <div className="w-full aspect-square rounded-xl shadow-lg mb-4 overflow-hidden relative">
                                            {(card.cover.includes('/') || card.cover.includes('.')) ? (
                                                <img src={card.cover} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className={`w-full h-full ${card.cover} group-hover:scale-105 transition-transform duration-500`}></div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-[var(--text-main)] truncate">{card.title}</h3>
                                        <p className="text-sm text-[var(--text-secondary)] truncate">{card.subtitle}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}

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
                            {playlists.map((pl: Playlist) => (
                                <PlaylistCard
                                    key={pl.id}
                                    playlist={pl}
                                    variant="compact"
                                    onClick={() => handlePlayPlaylist(pl)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Jump Back In */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 text-[var(--text-secondary)]">{t('home.jumpBackIn')}</h2>
                        <div className="grid grid-cols-6 gap-6">
                            {playlists.slice(0, 6).map((pl: Playlist) => (
                                <div
                                    key={pl.id}
                                    className="group cursor-pointer"
                                    onClick={() => handlePlayPlaylist(pl)}
                                >
                                    <div className={`w-full aspect-square ${pl.cover} rounded-xl mb-3 hover:scale-105 transition-transform shadow-lg shadow-black/20`}></div>
                                    <div className="font-medium text-sm truncate text-[var(--text-main)]">{pl.title}</div>
                                    <div className="text-xs text-[var(--text-muted)]">{t('sidebar.playlists')}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default HomeView;
