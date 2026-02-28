import React from 'react';
import { Loader2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SongRow } from '../../components';
import type { Song } from '../../types';

interface SearchResultsViewProps {
    searchQuery: string;
    isSearching: boolean;
    mergedResults: Song[];
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
    searchQuery,
    isSearching,
    mergedResults,
}) => {
    const { t } = useTranslation();

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold italic">
                    {t('home.searchResultsFor')} "{searchQuery}"
                </h2>
                <div className="flex items-center gap-3">
                    {isSearching && (
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                    )}
                    <span className="text-sm text-[var(--text-muted)]">
                        {mergedResults.length} {t('home.resultsFound')}
                    </span>
                </div>
            </div>

            {isSearching ? (
                <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)] space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin opacity-30" />
                    <p className="text-lg">{t('home.searching', '搜索中...')}</p>
                </div>
            ) : mergedResults.length > 0 ? (
                <div className="space-y-2">
                    {mergedResults.map((song) => (
                        <SongRow key={`${song.id}-${song.bestSource}`} song={song} />
                    ))}
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)] space-y-4">
                    <Search className="w-16 h-16 opacity-20" />
                    <p className="text-lg">{t('home.noResults')}</p>
                </div>
            )}
        </section>
    );
};
