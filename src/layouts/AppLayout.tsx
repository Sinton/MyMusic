import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainView from './MainView';
import { PlayerBar, FullScreenPlayer } from '../components/player';
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

    const [activeView, setActiveView] = useState('Home');

    const { isPlaying, currentTimeSec, durationSec, setProgress } = usePlayerStore();

    React.useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                if (currentTimeSec < durationSec) {
                    setProgress(currentTimeSec + 1);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentTimeSec, durationSec, setProgress]);

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
                onNavigate={setActiveView}
                onOpenAuth={openAuthModal}
            />
            <main className="flex-1 relative flex flex-col min-w-0">
                <MainView activeView={activeView} onNavigate={setActiveView} />
                <PlayerBar onExpand={openFullScreenPlayer} />
                <FullScreenPlayer
                    isOpen={isFullScreenPlayerOpen}
                    onClose={closeFullScreenPlayer}
                    onNavigate={setActiveView}
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
