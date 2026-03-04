import React from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../components/common/Skeleton';
import type { Album } from '../../types';

interface NewestAlbumsSectionProps {
    albums: Album[];
    isLoading: boolean;
    onNavigate?: (view: string) => void;
}

export const NewestAlbumsSection: React.FC<NewestAlbumsSectionProps> = ({
    albums,
    isLoading,
    onNavigate,
}) => {
    const { t } = useTranslation();

    return (
        <section className="mb-12">
            <h2 className="text-xl font-bold mb-6 text-[var(--text-main)]">
                {t('home.sections.newReleases')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="w-full aspect-square rounded-2xl bg-white/5" />
                            <Skeleton className="h-4 w-3/4 bg-white/5 rounded" />
                        </div>
                    ))
                ) : (
                    albums.slice(0, 10).map((album: Album) => (
                        <div
                            key={album.id}
                            className="group p-3 rounded-2xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-all cursor-pointer"
                            onClick={() => onNavigate?.(`Album:${album.id}`)}
                        >
                            <div className="w-full aspect-square rounded-xl shadow-lg mb-3 overflow-hidden relative">
                                <img
                                    src={album.cover}
                                    alt={album.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="font-bold text-[var(--text-main)] truncate text-sm">
                                {album.title}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] truncate">
                                {album.artist}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};
