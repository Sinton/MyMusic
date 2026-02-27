import React from 'react';
import { TrendingUp, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FeatureCard } from '../components';
import { Skeleton } from '../components/common/Skeleton';
import { useNeteaseToplist } from '../hooks/useNeteaseData';
import type { Playlist } from '../types';

interface ExploreViewProps {
    onNavigate?: (view: string) => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    // Replace Mock Data with Real NetEase Toplists
    const { playlists: toplists, isLoading: isToplistLoading } = useNeteaseToplist();

    const handleQuickPlay = () => {
        // Fallback or random play logic could be directed here
        // For now, let's just navigate to the first chart if it exists
        if (toplists && toplists.length > 0) {
            onNavigate?.(`Playlist:${toplists[0].id}`);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
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

            {/* Charts (Real NetEase Toplists) */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[var(--text-secondary)]">{t('explore.charts')}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {isToplistLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
                        ))
                    ) : (
                        toplists.slice(0, 16).map((playlist: Playlist) => (
                            <div
                                key={playlist.id}
                                onClick={() => onNavigate?.(`Playlist:${playlist.id}`)}
                                className="relative h-40 rounded-xl overflow-hidden cursor-pointer group shadow-lg"
                            >
                                {playlist.cover ? (
                                    <img src={playlist.cover} alt={playlist.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-800" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end">
                                    <span className="font-bold text-white text-lg drop-shadow-md">
                                        {playlist.title}
                                    </span>
                                    <span className="text-xs text-white/70 mt-1">{playlist.count} 首</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default ExploreView;
