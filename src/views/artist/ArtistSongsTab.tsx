import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListMusic } from 'lucide-react';
import { SongRow } from '../../components';
import { ListSkeleton } from '../../components/common/Skeleton';
import type { Song } from '../../types';

interface ArtistSongsTabProps {
    searchQuery: string;
    songs: Song[];
    isLoading: boolean;
}

export const ArtistSongsTab: React.FC<ArtistSongsTabProps> = ({ searchQuery, songs, isLoading }) => {
    const { t } = useTranslation();

    return (
        <section className="animate-fade-in w-full">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-4 text-[var(--text-main)] tracking-tight">
                <ListMusic className="w-6 h-6 text-[var(--accent-color)]" />
                {searchQuery ? t('home.searchResultsFor') : t('artist.popularTracks')}
            </h2>
            <div className="space-y-4">
                {isLoading ? (
                    <ListSkeleton rows={5} />
                ) : (
                    songs.map((song) => (
                        <div key={song.songId} className="group relative">
                            <SongRow song={song} />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};
