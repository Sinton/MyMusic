import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid } from 'lucide-react';
import { AlbumCard } from '../../components';
import { Skeleton } from '../../components/common/Skeleton';
import { getPlatformAdapter } from '../../lib/platform';
import type { Album } from '../../types';

interface ArtistAlbumsTabProps {
    albums: Album[];
    isLoading: boolean;
    onNavigate?: (view: string) => void;
    pagination: {
        hasNextPage: boolean;
        isFetchingNextPage: boolean;
        fetchNextPage: () => void;
    };
}

export const ArtistAlbumsTab: React.FC<ArtistAlbumsTabProps> = ({ albums, isLoading, onNavigate, pagination }) => {
    const { t } = useTranslation();
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pagination.hasNextPage || pagination.isFetchingNextPage) return;

        const scrollContainer = loadMoreRef.current?.closest('.main-scroller') as HTMLElement | null;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    pagination.fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: '300px', root: scrollContainer }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [pagination.hasNextPage, pagination.isFetchingNextPage, pagination.fetchNextPage]);

    return (
        <section className="animate-fade-in w-full">
            <h2 className="text-xl font-bold mb-10 flex items-center gap-4 text-[var(--text-main)] tracking-tight">
                <LayoutGrid className="w-6 h-6 text-[var(--accent-color)]" />
                {t('artist.albums')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="w-full aspect-square rounded-2xl" />
                            <Skeleton className="w-3/4 h-4 rounded" />
                            <Skeleton className="w-1/2 h-3 rounded" />
                        </div>
                    ))
                ) : (
                    albums.map((album: Album) => (
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
    );
};
