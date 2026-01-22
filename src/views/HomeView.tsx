import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { FeatureCard, PlaylistCard, SongRow } from '../components';
import { homeCards } from '../data/mockData';
import { usePlaylists, useSongs } from '../hooks/useData';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { HomeCard, Playlist, Track } from '../types';

interface HomeViewProps {
    onNavigate?: (view: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { playlists } = usePlaylists();
    const { songs } = useSongs();
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
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Search Bar */}
            <section className="mb-12 pt-4 pb-4">
                <div className="relative max-w-2xl mx-auto">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchQuery ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for songs, artists, or albums..."
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)] text-white rounded-2xl py-4 pl-12 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:bg-[rgba(255,255,255,0.08)] placeholder-[var(--text-muted)] transition-all shadow-2xl"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
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
                            Search Results for "{searchQuery}"
                        </h2>
                        <span className="text-sm text-[var(--text-muted)]">{searchResults.length} results found</span>
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
                            <p className="text-lg">No songs found matching your search.</p>
                        </div>
                    )}
                </section>
            ) : (
                /* Default Home View */
                <>
                    {/* Hero Section */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6">Good Morning</h2>
                        <div className="grid grid-cols-3 gap-6">
                            {homeCards.map((card: HomeCard, i: number) => (
                                <FeatureCard
                                    key={i}
                                    title={card.title}
                                    description={card.description}
                                    gradient={card.color}
                                    size="sm"
                                />
                            ))}
                        </div>
                    </section>

                    {/* Recently Played */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--text-secondary)]">Recently Played</h2>
                            <button
                                onClick={() => onNavigate?.('Playlists')}
                                className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-white transition-colors"
                            >
                                See All
                            </button>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
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
                        <h2 className="text-xl font-bold mb-6 text-[var(--text-secondary)]">Jump Back In</h2>
                        <div className="grid grid-cols-6 gap-6">
                            {playlists.slice(0, 6).map((pl: Playlist) => (
                                <div
                                    key={pl.id}
                                    className="group cursor-pointer"
                                    onClick={() => handlePlayPlaylist(pl)}
                                >
                                    <div className={`w-full aspect-square ${pl.cover} rounded-xl mb-3 hover:scale-105 transition-transform shadow-lg shadow-black/20`}></div>
                                    <div className="font-medium text-sm truncate">{pl.title}</div>
                                    <div className="text-xs text-[var(--text-muted)]">Playlist</div>
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
