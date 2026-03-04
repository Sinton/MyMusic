import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaylistCard } from '../../components';
import { Skeleton } from '../../components/common/Skeleton';
import type { Playlist } from '../../types';

interface ToplistsSectionProps {
    toplists: Playlist[];
    isLoading: boolean;
    onNavigate?: (view: string) => void;
    handlePlayPlaylist: (playlist: Playlist) => void;
}

export const ToplistsSection: React.FC<ToplistsSectionProps> = ({
    toplists,
    isLoading,
    onNavigate,
    handlePlayPlaylist,
}) => {
    const { t } = useTranslation();

    return (
        <>
            {/* SECTION 3: Toplists (Charts) */}
            <section className="mb-12">
                <h2 className="text-xl font-bold mb-6 text-[var(--text-main)]">
                    {t('explore.charts')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {isLoading ? (
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
                                <img
                                    src={pl.cover}
                                    alt={pl.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                                    <h3 className="font-bold text-white text-lg">{pl.title}</h3>
                                    <p className="text-white/60 text-xs">
                                        {pl.count} {t('playlist.songs')}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Quick Access to Library */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[var(--text-secondary)]">
                        {t('home.recentlyPlayed')}
                    </h2>
                    <button
                        onClick={() => onNavigate?.('Playlists')}
                        className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                        {t('home.seeAll')}
                    </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2 hide-scrollbar">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="shrink-0 w-48 h-16 rounded-xl" />
                        ))
                    ) : (
                        toplists.map((pl: Playlist) => (
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
                <h2 className="text-xl font-bold mb-6 text-[var(--text-secondary)]">
                    {t('home.jumpBackIn')}
                </h2>
                <div className="grid grid-cols-6 gap-6">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="w-full aspect-square rounded-xl" />
                                <Skeleton className="w-3/4 h-3 rounded" />
                            </div>
                        ))
                    ) : (
                        toplists.slice(0, 6).map((pl: Playlist) => (
                            <div
                                key={pl.id}
                                className="group cursor-pointer"
                                onClick={() => handlePlayPlaylist(pl)}
                            >
                                <div
                                    className={`w-full aspect-square rounded-xl mb-3 hover:scale-105 transition-transform shadow-lg shadow-black/20`}
                                    style={{
                                        backgroundImage: `url(${pl.cover})`,
                                        backgroundSize: 'cover',
                                    }}
                                ></div>
                                <div className="font-medium text-sm truncate text-[var(--text-main)]">
                                    {pl.title}
                                </div>
                                <div className="text-xs text-[var(--text-muted)]">
                                    {t('sidebar.playlists')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </>
    );
};
