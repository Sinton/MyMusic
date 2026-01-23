import React, { Suspense } from 'react';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { LoadingFallback } from '../components/common/LoadingFallback';

const HomeView = React.lazy(() => import('../views/HomeView'));
const ExploreView = React.lazy(() => import('../views/ExploreView'));
const LibraryView = React.lazy(() => import('../views/LibraryView'));
const SettingsView = React.lazy(() => import('../views/SettingsView'));
const PlaylistDetailView = React.lazy(() => import('../views/PlaylistDetailView'));
const AlbumDetailView = React.lazy(() => import('../views/AlbumDetailView'));
import { useAlbums } from '../hooks/useData';

interface MainViewProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

const MainView: React.FC<MainViewProps> = ({ activeView, onNavigate }) => {
    const { userPlaylists } = usePlaylistStore();
    const { albums } = useAlbums();

    const renderContent = () => {
        // Handle playlist detail view
        if (activeView.startsWith('Playlist:')) {
            const playlistId = parseInt(activeView.split(':')[1]);
            const playlist = userPlaylists.find(p => p.id === playlistId);
            if (playlist) {
                return <PlaylistDetailView key={activeView} playlist={playlist} onBack={() => onNavigate('Library')} />;
            }
        }

        // Handle Album detail view
        if (activeView.startsWith('Album:')) {
            const albumId = parseInt(activeView.split(':')[1]);
            const album = albums.find(a => a.id === albumId);

            if (album) {
                return (
                    <AlbumDetailView
                        key={activeView}
                        album={album}
                        onBack={() => onNavigate('Library')}
                        onNavigate={onNavigate}
                    />
                );
            }
        }

        // Handle Artist detail view (Placeholder)
        if (activeView.startsWith('Artist:')) {
            const artistName = activeView.split(':')[1];
            return (
                <div className="animate-fade-in p-8 text-center py-40">
                    <h2 className="text-3xl font-bold mb-4">{artistName}</h2>
                    <p className="text-[var(--text-secondary)] mb-8">Artist Detail Page Coming Soon</p>
                    <button
                        onClick={() => onNavigate('Library')}
                        className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-full font-bold"
                    >
                        Back to Library
                    </button>
                </div>
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
        <div className="flex-1 h-full overflow-y-auto w-full pt-16 pb-32 px-8 relative scroll-smooth hide-scrollbar">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[var(--bg-color)] to-transparent pointer-events-none z-10"></div>
            <Suspense fallback={<LoadingFallback />}>
                {renderContent()}
            </Suspense>
        </div>
    );
};

export default MainView;
