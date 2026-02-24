import React, { useState, useMemo } from 'react';
import { mockArtistAvatars } from '../data/mockData';
import { Play, Pause, Star, Info, Search, Music, LayoutGrid, ListMusic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SongRow } from '../components';
import AlbumCard from '../components/AlbumCard';
import { Skeleton, ListSkeleton } from '../components/common/Skeleton';
import { ImmersiveHeader } from '../components/common/ImmersiveHeader';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useSongsByArtist, useAlbumsByArtist } from '../hooks/useData';
import type { Artist, Track, Album } from '../types';

interface ArtistDetailViewProps {
    artistName: string;
    onBack: () => void;
    onNavigate?: (view: string) => void;
}

const ArtistDetailView: React.FC<ArtistDetailViewProps> = ({ artistName, onNavigate }) => {
    const { t } = useTranslation();
    const { setTrack, play, pause, isPlaying, currentTrack, setQueue } = usePlayerStore();

    // Efficiently fetch only relevant data
    const { songs: artistSongs, isLoading: isSongsLoading } = useSongsByArtist(artistName);
    const { albums: artistAlbums, isLoading: isAlbumsLoading } = useAlbumsByArtist(artistName);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums' | 'about'>('all');

    // Construct artist object
    const artistData: Artist = useMemo(() => {
        return {
            id: artistSongs[0]?.artistId || 999,
            name: artistName,
            avatar: mockArtistAvatars[artistName] || (artistSongs[0]?.sources[0]?.platform === 'NetEase Cloud' ? 'bg-rose-600' : 'bg-indigo-600'),
            bio: `${artistName} is a global music icon known for their ability to blend cross-genre influences into cohesive masterpieces. With a career spanning over a decade, they have consistently pushed the boundaries of sound design and lyrical storytelling.`,
            genres: ['Pop', 'R&B', 'Electronic', 'Acoustic'],
            popularSongs: artistSongs,
            albums: artistAlbums
        };
    }, [artistName, artistSongs, artistAlbums]);

    // Filtering logic
    const filteredSongs = useMemo(() => {
        const songs = artistData.popularSongs || [];
        if (!searchQuery) return songs.slice(0, 10);
        return songs.filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.album.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [artistData.popularSongs, searchQuery]);

    const filteredAlbums = useMemo(() => {
        const albums = artistData.albums || [];
        if (!searchQuery) return albums;
        return albums.filter(a =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [artistData.albums, searchQuery]);

    const handlePlayAll = () => {
        if (filteredSongs.length > 0) {
            const tracks: Track[] = filteredSongs.map(song => ({
                id: song.id,
                title: song.title,
                artist: song.artist,
                artistId: song.artistId,
                album: song.album,
                albumId: song.albumId,
                duration: song.duration,
                currentTime: '0:00',
                source: song.bestSource,
                quality: song.sources[0]?.qualityLabel || 'Standard',
            }));

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
                        <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border-4 border-white/20 transition-transform duration-700 group-hover:scale-105">
                            {artistData.avatar && artistData.avatar.startsWith('http') ? (
                                <img src={artistData.avatar} className="w-full h-full object-cover" alt={artistName} />
                            ) : artistData.albums?.[0] ? (
                                <img src={artistData.albums[0].cover} className="w-full h-full object-cover" alt={artistName} />
                            ) : (
                                <div className={`w-full h-full ${artistData.avatar} flex items-center justify-center`}>
                                    <Music className="w-24 h-24 text-white/20" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-start animate-slide-up pb-2">
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
                                    <span className="text-2xl font-black text-[var(--text-main)]">{(artistData.popularSongs?.length || 0)}</span>
                                    <span className="uppercase tracking-widest text-[10px] opacity-60">{t('library.tabs.songs')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" />
                                    <span className="text-2xl font-black text-[var(--text-main)]">{artistData.albums?.length || 0}</span>
                                    <span className="uppercase tracking-widest text-[10px] opacity-60">{t('library.tabs.albums')}</span>
                                </div>
                            </div>
                        </div>
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
                                {isSongsLoading ? (
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
                                {isAlbumsLoading ? (
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
                                            onClick={() => onNavigate && onNavigate(`Album:${album.id}`)}
                                        />
                                    ))
                                )}
                            </div>
                        </section>
                    )}

                    {/* 3. About Section - Transparent & Typography Driven */}
                    {(activeTab === 'all' || activeTab === 'about') && (
                        <section className="animate-fade-in w-full pt-8">
                            <h2 className="text-xl font-bold mb-10 flex items-center gap-4 text-[var(--text-main)] tracking-tight">
                                <Info className="w-6 h-6 text-[var(--accent-color)]" />
                                {t('artist.about')}
                            </h2>

                            <div className="relative pl-12">
                                <div className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed opacity-90 mb-10 max-w-4xl">
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
