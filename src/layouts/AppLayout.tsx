import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { TitleBar } from '../components/common/TitleBar';
import Sidebar from './Sidebar';
import MainView from './MainView';
import { PlayerBar, FullScreenPlayer } from '../components/player';
import { AudioEngine } from '../components/AudioEngine';
import { AuthModal } from '../components';
import { usePlatformStore } from '../stores/usePlatformStore';
import { usePlayerStore } from '../stores/usePlayerStore';


import { useUIStore } from '../stores/useUIStore';

const AppLayout: React.FC = () => {
    // UI Store State
    const {
        isFullScreenPlayerOpen,
        openFullScreenPlayer,
        closeFullScreenPlayer,
        authModalOpen,
        authModalTarget,
        openAuthModal,
        closeAuthModal
    } = useUIStore();

    const [history, setHistory] = useState<string[]>(['Home']);
    const activeView = history[history.length - 1] || 'Home';

    const handleNavigate = (view: string) => {
        const rootViews = ['Home', 'Explore', 'Library', 'Settings'];
        if (rootViews.includes(view)) {
            // Treat these as "root" tabs: replace the stack
            setHistory([view]);
        } else {
            // Detail views (NeteasePlaylist, Album, Artist etc) push to stack
            setHistory(prev => {
                if (prev[prev.length - 1] === view) return prev;
                return [...prev, view];
            });
        }
    };

    const handleBack = () => {
        setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
    };

    const { currentTrack } = usePlayerStore();

    React.useEffect(() => {
        if (currentTrack) {
            invoke('log_info', { message: `[AppLayout] Current Track: ${JSON.stringify(currentTrack)}` }).catch(() => { });
        }
    }, [currentTrack.id]);



    const connectPlatform = usePlatformStore((state) => state.connectPlatform);

    const handleConnect = (platformName: string) => {
        connectPlatform(platformName);
        // Modal will close automatically via AuthModal internal logic calling onClose, or we can ensure it closes here if needed.
        // But AuthModal receives onClose={closeAuthModal} which just toggles state. 
        // AuthModal internal logic: calling onConnect then onClose.
        // So this is fine.
    };

    return (
        <div className="flex w-screen h-screen overflow-hidden text-[var(--text-main)] font-sans antialiased selection:bg-[var(--accent-color)] selection:text-white">
            <Sidebar
                activeView={activeView}
                onNavigate={handleNavigate}
                onOpenAuth={openAuthModal}
            />
            <main className="flex-1 relative flex flex-col min-w-0">
                <TitleBar canGoBack={history.length > 1} onBack={handleBack} />
                <MainView
                    activeView={activeView}
                    onNavigate={handleNavigate}
                />
                <AudioEngine />
                <PlayerBar onExpand={openFullScreenPlayer} />
                <FullScreenPlayer
                    isOpen={isFullScreenPlayerOpen}
                    onClose={closeFullScreenPlayer}
                    onNavigate={handleNavigate}
                />

                <AuthModal
                    isOpen={authModalOpen}
                    onClose={closeAuthModal}
                    platform={authModalTarget}
                    onConnect={handleConnect}
                />
            </main>
        </div>
    );
};

export default AppLayout;
