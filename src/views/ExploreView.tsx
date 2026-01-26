import React, { useState, useMemo } from 'react';
import { TrendingUp, Flame, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FeatureCard, GenreCard, SongRow } from '../components';
import { useSongs, useGenres } from '../hooks/useData';
import { usePlayerStore } from '../stores/usePlayerStore';

const ExploreView: React.FC = () => {
    const { t } = useTranslation();
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const { songs } = useSongs();
    const { genres } = useGenres();
    const { setTrack, play } = usePlayerStore();

    const filteredSongs = useMemo(() => {
        if (!selectedGenre) return [];
        return songs.filter(s => s.genre === selectedGenre);
    }, [selectedGenre, songs]);

    const handleQuickPlay = () => {
        if (songs.length > 0) {
            const randomSong = songs[Math.floor(Math.random() * songs.length)];
            const track: any = {
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

    // Map chart names to translation keys
    const chartMapping: Record<string, string> = {
        'China Top 100': 'chinaTop',
        'Global Viral': 'globalViral',
        'K-Pop Hot': 'kpopHot',
        'Indie Picks': 'indiePicks'
    };

    if (selectedGenre) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <button
                    onClick={() => setSelectedGenre(null)}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors mb-4 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">{t('explore.back')}</span>
                </button>

                <header className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">{selectedGenre}</h1>
                    <p className="text-[var(--text-muted)]">{t('explore.topSongsIn', { genre: selectedGenre })}</p>
                </header>

                <div className="space-y-2">
                    {filteredSongs.length > 0 ? (
                        filteredSongs.map(song => (
                            <SongRow key={song.id} song={song} />
                        ))
                    ) : (
                        <div className="py-20 text-center text-[var(--text-muted)] border border-dashed border-[var(--glass-border)] rounded-2xl">
                            {t('explore.noSongs')}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Featured Cards */}
            <div className="grid grid-cols-2 gap-4">
                <FeatureCard
                    title={t('explore.featured.top50')}
                    subtitle={t('explore.featured.trending')}
                    gradient="bg-gradient-to-r from-pink-600 to-rose-500"
                    icon={TrendingUp}
                    size="lg"
                    onClick={handleQuickPlay}
                />
                <FeatureCard
                    title={t('explore.featured.newReleases')}
                    subtitle={t('explore.featured.new')}
                    gradient="bg-gradient-to-r from-violet-600 to-indigo-500"
                    icon={Flame}
                    size="lg"
                    onClick={handleQuickPlay}
                />
            </div>

            {/* Charts */}
            <section>
                <h2 className="text-xl font-bold mb-4 text-[var(--text-secondary)]">{t('explore.charts')}</h2>
                <div className="grid grid-cols-4 gap-4">
                    {Object.keys(chartMapping).map((chart) => (
                        <div
                            key={chart}
                            onClick={() => setSelectedGenre(chart)}
                            className="h-32 rounded-xl bg-[var(--glass-highlight)] p-4 flex items-end cursor-pointer hover:bg-[var(--glass-border)] hover:scale-[1.02] active:scale-95 transition-all group"
                        >
                            <span className="font-semibold group-hover:text-[var(--accent-color)] transition-colors">
                                {t(`explore.chartNames.${chartMapping[chart]}`)}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Browse by Genre */}
            <section>
                <h2 className="text-xl font-bold mb-4">{t('explore.browseGenres')}</h2>
                <div className="grid grid-cols-4 gap-4">
                    {genres.map((genre: string) => (
                        <GenreCard
                            key={genre}
                            genre={genre}
                            onClick={(g) => setSelectedGenre(g)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ExploreView;
