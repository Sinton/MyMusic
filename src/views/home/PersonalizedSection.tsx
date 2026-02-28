import React from 'react';
import { Cloud, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../components/common/Skeleton';
import type { Playlist } from '../../types';

interface PersonalizedSectionProps {
    playlists: Playlist[];
    isLoading: boolean;
    onNavigate?: (view: string) => void;
}

export const PersonalizedSection: React.FC<PersonalizedSectionProps> = ({
    playlists,
    isLoading,
    onNavigate,
}) => {
    const { t } = useTranslation();

    return (
        <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
                <Cloud className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-[var(--text-main)]">
                    {t('home.neteaseRecommend', '网易云推荐')}
                </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="w-full aspect-square rounded-2xl bg-white/5" />
                            <Skeleton className="h-4 w-3/4 bg-white/5 rounded" />
                            <Skeleton className="h-3 w-1/2 bg-white/5 rounded" />
                        </div>
                    ))
                ) : (
                    playlists.slice(0, 8).map((pl) => (
                        <div
                            key={pl.id}
                            className="group p-4 rounded-2xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-all cursor-pointer"
                            onClick={() => onNavigate?.(`Playlist:${pl.id}`)}
                        >
                            <div className="w-full aspect-square rounded-xl shadow-lg mb-4 overflow-hidden relative">
                                {pl.cover ? (
                                    <img
                                        src={pl.cover}
                                        alt={pl.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-red-500/30 to-pink-500/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                        <Music className="w-12 h-12 text-[var(--text-muted)]" />
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-[var(--text-main)] truncate">{pl.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)] truncate">
                                {pl.count} {t('home.tracks', '首')}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};
