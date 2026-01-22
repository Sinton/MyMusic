import React from 'react';
import HomeView from '../views/HomeView';
import ExploreView from '../views/ExploreView';
import LibraryView from '../views/LibraryView';
import SettingsView from '../views/SettingsView';

interface MainViewProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

import PlaylistDetailView from '../views/PlaylistDetailView';
import { usePlaylistStore } from '../stores/usePlaylistStore';

interface MainViewProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

const MainView: React.FC<MainViewProps> = ({ activeView, onNavigate }) => {
    const { userPlaylists } = usePlaylistStore();

    const renderContent = () => {
        if (activeView.startsWith('Playlist:')) {
            const playlistId = parseInt(activeView.split(':')[1]);
            const playlist = userPlaylists.find(p => p.id === playlistId);
            if (playlist) {
                return <PlaylistDetailView playlist={playlist} onBack={() => onNavigate('Library')} />;
            }
        }

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
            {renderContent()}
        </div>
    );
};

export default MainView;
