import React, { useState, useMemo } from 'react';
import { HomeSearchBar } from './home/HomeSearchBar';
import { SearchResultsView } from './home/SearchResultsView';
import { PersonalizedSection } from './home/PersonalizedSection';
import { NewestAlbumsSection } from './home/NewestAlbumsSection';
import { ToplistsSection } from './home/ToplistsSection';
import QueryErrorBanner from '../components/common/QueryErrorBanner';
import { useNeteaseSearch, useNeteasePersonalized, useNeteaseNewestAlbums, useNeteaseToplist } from '../hooks/netease';
import { useQQSearch } from '../hooks/qq';
import type { Song } from '../types';

interface HomeViewProps {
    onNavigate?: (view: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // NetEase state
    // Use activeQuery instead of debouncedQuery for search triggering
    const [activeQuery, setActiveQuery] = useState('');

    const { songs: neteaseResults, isLoading: isNeteaseSearching } = useNeteaseSearch(activeQuery, {
        enabled: !!activeQuery.trim(),
    });

    const { songs: qqResults, isLoading: isQQSearching } = useQQSearch(activeQuery, {
        enabled: !!activeQuery.trim(),
    });

    // Feature 1: Personalized Playlists (Made For You)
    const { playlists: personalizedPlaylists, isLoading: isPersonalizedLoading, isError: isPersonalizedError, refetch: refetchPersonalized } = useNeteasePersonalized();

    // Feature 2: Newest Albums
    const { albums: newestAlbums, isLoading: isNewestAlbumsLoading, isError: isAlbumsError, refetch: refetchAlbums } = useNeteaseNewestAlbums();

    // Feature 3: Toplists (Charts)
    const { playlists: toplists, isLoading: isToplistLoading, isError: isToplistError, refetch: refetchToplist } = useNeteaseToplist();

    // Combine NetEase and QQ results, merging songs with same title and artist
    const mergedResults = useMemo(() => {
        if (!activeQuery.trim()) return [];

        const merged: Song[] = [];

        // Interleave the results so that rank #1 from NetEase is followed by rank #1 from QQ, etc.
        // This ensures the top results from both platforms appear at the top of the combined list
        // instead of all NetEase results showing up before any QQ results.
        const combined: Song[] = [];
        const maxLength = Math.max(neteaseResults.length, qqResults.length);
        for (let i = 0; i < maxLength; i++) {
            if (i < neteaseResults.length) combined.push(neteaseResults[i]);
            if (i < qqResults.length) combined.push(qqResults[i]);
        }

        // Helper to normalize strings for comparison (ignore case, spaces, parens)
        const normalize = (s: string) => s.toLowerCase().replace(/[\s()（）]/g, '');

        combined.forEach(song => {
            const existing = merged.find(m =>
                normalize(m.title) === normalize(song.title) &&
                normalize(m.artist) === normalize(song.artist)
            );

            if (existing) {
                // Add new source if not already present
                const newSources = song.sources.filter(
                    s1 => !existing.sources.some(s2 => s2.platform === s1.platform)
                );
                existing.sources = [...existing.sources, ...newSources];

                // If the existing entry is missing a cover but the new one has it, copy it over
                if (!existing.cover && song.cover) {
                    existing.cover = song.cover;
                }
            } else {
                merged.push({ ...song }); // Deep clone the top level so we can push sources to it
            }
        });

        // Optional: Sort heavily by relevance (number of sources), but keep their original interwoven rank otherwise.
        merged.sort((a, b) => b.sources.length - a.sources.length);

        return merged;
    }, [activeQuery, neteaseResults, qqResults]);

    const isSearching = (isNeteaseSearching || isQQSearching) && !!activeQuery.trim();

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Search Bar */}
            <HomeSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setActiveQuery={setActiveQuery}
            />

            {activeQuery ? (
                /* Search Results View */
                <SearchResultsView
                    searchQuery={searchQuery}
                    isSearching={isSearching}
                    mergedResults={mergedResults}
                />
            ) : (
                /* Default Home View */
                <>
                    {/* Error banners (only show if not loading and has error) */}
                    {isPersonalizedError && <QueryErrorBanner onRetry={refetchPersonalized} className="mx-2" />}
                    {isAlbumsError && <QueryErrorBanner onRetry={refetchAlbums} className="mx-2" />}
                    {isToplistError && <QueryErrorBanner onRetry={refetchToplist} className="mx-2" />}

                    {/* SECTION 1: Personalized Playlists (Made For You) */}
                    {!isPersonalizedError && <PersonalizedSection playlists={personalizedPlaylists} isLoading={isPersonalizedLoading} onNavigate={onNavigate} />}

                    {/* SECTION 2: Newest Albums */}
                    {!isAlbumsError && <NewestAlbumsSection albums={newestAlbums} isLoading={isNewestAlbumsLoading} onNavigate={onNavigate} />}

                    {/* SECTION 3: Toplists (Charts) and Recent Plays */}
                    {!isToplistError && <ToplistsSection toplists={toplists} isLoading={isToplistLoading} onNavigate={onNavigate} />}
                </>
            )}
        </div>
    );
};

export default HomeView;
