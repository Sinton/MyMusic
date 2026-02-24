import React, { Suspense, useEffect, useRef } from 'react';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { LoadingFallback } from '../components/common/LoadingFallback';

import HomeView from '../views/HomeView';
import ExploreView from '../views/ExploreView';
import LibraryView from '../views/LibraryView';

import SettingsView from '../views/SettingsView';
import PlaylistDetailView from '../views/PlaylistDetailView';
import NeteasePlaylistDetailView from '../views/NeteasePlaylistDetailView';
import AlbumDetailView from '../views/AlbumDetailView';
import ArtistDetailView from '../views/ArtistDetailView';
import { useAlbums } from '../hooks/useData';
import { useNeteaseAlbumDetail } from '../hooks/useNeteaseData';
import type { Album } from '../types';

interface MainViewProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

/**
 * Thin wrapper: fetches Netease album data, then delegates to the shared AlbumDetailView.
 */
const NeteaseAlbumWrapper: React.FC<{ albumId: number; onBack: () => void; onNavigate: (v: string) => void }> = ({ albumId, onBack, onNavigate }) => {
    const { album, isLoading } = useNeteaseAlbumDetail(albumId);

    // While loading or if no data yet, pass a skeleton album object
    const albumObj: Album = album ?? {
        id: albumId,
        title: '加载中...',
        artist: '',
        year: new Date().getFullYear(),
        cover: '',
    };

    return (
        <AlbumDetailView
            album={albumObj}
            onBack={onBack}
            onNavigate={onNavigate}
            externalSongs={album?.songs}
            externalLoading={isLoading}
        />
    );
};

const MainView: React.FC<MainViewProps> = ({ activeView, onNavigate }) => {
    const { userPlaylists } = usePlaylistStore();
    const { albums } = useAlbums();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Custom friction-based smooth scroll
    const scrollToTopSlowly = (element: HTMLElement, duration: number) => {
        const startY = element.scrollTop;
        if (startY === 0) return; // Already at top

        const startTime = performance.now();

        const animateScroll = (currentTime: number) => {
            const timeElapsed = currentTime - startTime;
            let progress = timeElapsed / duration;
            if (progress > 1) progress = 1;

            // Ease-Out Quart curve for a luxurious, slow-stopping feel
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            element.scrollTop = startY * (1 - easeOutQuart);

            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    };

    // Smoothly scroll to top whenever the activeView changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            // 700ms duration for a very elegant, deliberate slide
            scrollToTopSlowly(scrollContainerRef.current, 400);
        }
    }, [activeView]);

    const renderContent = () => {
        // Handle playlist detail view
        if (activeView.startsWith('Playlist:')) {
            const playlistId = parseInt(activeView.split(':')[1]);
            const playlist = userPlaylists.find(p => p.id === playlistId);
            if (playlist) {
                return <PlaylistDetailView key={activeView} playlist={playlist} onBack={() => onNavigate('Library')} />;
            }
            // Fallback: treat as NetEase playlist
            if (!isNaN(playlistId)) {
                return <NeteasePlaylistDetailView key={activeView} playlistId={playlistId} />;
            }
        }

        // Handle Album detail view
        if (activeView.startsWith('Album:')) {
            const albumId = parseInt(activeView.split(':')[1]);
            const album = albums.find((a: Album) => a.id === albumId);

            if (album) {
                // Local album — use AlbumDetailView directly
                return (
                    <AlbumDetailView
                        key={activeView}
                        album={album}
                        onBack={() => onNavigate('Library')}
                        onNavigate={onNavigate}
                    />
                );
            }

            // Fallback: treat as NetEase album — reuse AlbumDetailView via wrapper
            if (!isNaN(albumId)) {
                return (
                    <NeteaseAlbumWrapper
                        key={activeView}
                        albumId={albumId}
                        onBack={() => onNavigate('Home')}
                        onNavigate={onNavigate}
                    />
                );
            }
        }

        // Handle Artist detail view
        if (activeView.startsWith('Artist:')) {
            const artistName = activeView.split(':')[1];
            return (
                <ArtistDetailView
                    key={activeView}
                    artistName={artistName}
                    onBack={() => onNavigate('Library')}
                    onNavigate={onNavigate}
                />
            );
        }

        // Handle main views
        switch (activeView) {
            case 'Home':
                return <HomeView key={activeView} onNavigate={onNavigate} />;
            case 'Explore':
                return <ExploreView key={activeView} />;
            case 'Settings':
                return <SettingsView key={activeView} />;
            case 'My Music':
            case 'Library':
            case 'Playlists':
            default:
                return (
                    <LibraryView
                        key={activeView}
                        initialTab={activeView === 'Playlists' ? 'Playlists' : 'Songs'}
                        onNavigate={onNavigate}
                    />
                );
        }
    };

    return (
        <div className="flex-1 relative w-full h-full">
            {/* Gradient shadow spans the entire width, covering the scrollbar as well */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[var(--bg-color)] to-transparent pointer-events-none z-20" />

            <div
                ref={scrollContainerRef}
                className="w-full h-full overflow-y-auto pt-16 pb-32 px-8 relative scroll-smooth main-scroller"
            >
                <Suspense fallback={<LoadingFallback />}>
                    {renderContent()}
                </Suspense>
            </div>
        </div>
    );
};

export default MainView;
