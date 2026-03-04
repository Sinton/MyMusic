import React, { Suspense, useEffect, useRef } from 'react';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { LoadingFallback } from '../components/common/LoadingFallback';

import HomeView from '../views/HomeView';
import ExploreView from '../views/ExploreView';
import LibraryView from '../views/LibraryView';

import SettingsView from '../views/SettingsView';
import PlaylistDetailView from '../views/PlaylistDetailView';
import NeteasePlaylistDetailView from '../views/NeteasePlaylistDetailView';
import AlbumDetailView from '../views/AlbumDetailView';
import ArtistDetailView from '../views/ArtistDetailView';
import { useNeteaseAlbumDetail } from '../hooks/useNeteaseData';
import { useQQAlbumDetail } from '../hooks/useQQData';
import { useQishuiAlbumDetail } from '../hooks/useQishuiData';
import { parseRoute } from '../lib/routeUtils';
import type { Album } from '../types';

interface MainViewProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

/**
 * Thin wrapper: fetches Netease album data, then delegates to the shared AlbumDetailView.
 */
const NeteaseAlbumWrapper: React.FC<{ albumId: number | string; onBack: () => void; onNavigate: (v: string) => void }> = ({ albumId, onBack, onNavigate }) => {
    const { album, isLoading } = useNeteaseAlbumDetail(Number(albumId));

    const albumObj: Album = album ?? {
        id: Number(albumId),
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

/**
 * Thin wrapper: fetches QQ album data, then delegates to it.
 */
const QQAlbumWrapper: React.FC<{ albumMid: string; onBack: () => void; onNavigate: (v: string) => void }> = ({ albumMid, onBack, onNavigate }) => {
    const { album, isLoading } = useQQAlbumDetail(albumMid);

    const albumObj: Album = album ?? {
        id: albumMid,
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

/**
 * Thin wrapper: fetches Qishui album data, then delegates to it.
 */
const SodaAlbumWrapper: React.FC<{ albumId: string; onBack: () => void; onNavigate: (v: string) => void }> = ({ albumId, onBack, onNavigate }) => {
    const { album, isLoading } = useQishuiAlbumDetail(albumId);

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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const hasTrack = currentTrack && currentTrack.id !== 0;

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
            scrollToTopSlowly(scrollContainerRef.current, 400);
        }
    }, [activeView]);

    const renderContent = () => {
        const route = parseRoute(activeView);

        switch (route.type) {
            case 'playlist': {
                const playlist = userPlaylists.find(p => p.id === route.id);
                if (playlist) {
                    return <PlaylistDetailView key={activeView} playlist={playlist} onBack={() => onNavigate('Library')} />;
                }
                return <NeteasePlaylistDetailView key={activeView} playlistId={Number(route.id)} />;
            }
            case 'album':
                if (route.platform === 'qq') {
                    return (
                        <QQAlbumWrapper
                            key={activeView}
                            albumMid={String(route.id)}
                            onBack={() => onNavigate('Home')}
                            onNavigate={onNavigate}
                        />
                    );
                }
                if (route.platform === 'soda') {
                    return (
                        <SodaAlbumWrapper
                            key={activeView}
                            albumId={String(route.id)}
                            onBack={() => onNavigate('Home')}
                            onNavigate={onNavigate}
                        />
                    );
                }
                return (
                    <NeteaseAlbumWrapper
                        key={activeView}
                        albumId={route.id}
                        onBack={() => onNavigate('Home')}
                        onNavigate={onNavigate}
                    />
                );
            case 'artist':
                return (
                    <ArtistDetailView
                        key={activeView}
                        artistName={route.name}
                        artistId={route.id}
                        platform={route.platform}
                        onBack={() => onNavigate('Library')}
                        onNavigate={onNavigate}
                    />
                );
            case 'home':
                return <HomeView key={activeView} onNavigate={onNavigate} />;
            case 'explore':
                return <ExploreView key={activeView} />;
            case 'settings':
                return <SettingsView key={activeView} />;
            case 'library':
                return (
                    <LibraryView
                        key={activeView}
                        initialTab={route.tab}
                        onNavigate={onNavigate}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 relative w-full h-full">
            {/* Gradient shadow spans the entire width, covering the scrollbar as well */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[var(--bg-color)] to-transparent pointer-events-none z-20" />

            <div
                ref={scrollContainerRef}
                className={`w-full h-full overflow-y-auto pt-16 px-8 relative scroll-smooth main-scroller transition-all duration-700 ease-out ${hasTrack ? 'pb-32' : 'pb-8'}`}
            >
                <Suspense fallback={<LoadingFallback />}>
                    {renderContent()}
                </Suspense>
            </div>
        </div>
    );
};

export default MainView;
