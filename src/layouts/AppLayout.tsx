import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainView from './MainView';
import { PlayerBar, FullScreenPlayer } from '../components/player';
import { AuthModal } from '../components';
import { usePlatformStore } from '../stores/usePlatformStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { Platform } from '../types';

const AppLayout: React.FC = () => {
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [activeView, setActiveView] = useState('Home');

    // Auth State
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authTarget, setAuthTarget] = useState<Platform | null>(null);

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

    const handleOpenAuth = (platform: Platform) => {
        setAuthTarget(platform);
        setAuthModalOpen(true);
    };

    const handleConnect = (platformName: string) => {
        connectPlatform(platformName);
    };

    return (
        <div className="flex w-screen h-screen overflow-hidden text-[var(--text-main)] font-sans antialiased selection:bg-[var(--accent-color)] selection:text-white">
            <Sidebar
                activeView={activeView}
                onNavigate={setActiveView}
                onOpenAuth={handleOpenAuth}
            />
            <main className="flex-1 relative flex flex-col min-w-0">
                <MainView activeView={activeView} onNavigate={setActiveView} />
                <PlayerBar onExpand={() => setIsPlayerOpen(true)} />
                <FullScreenPlayer isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} />

                <AuthModal
                    isOpen={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    platform={authTarget}
                    onConnect={handleConnect}
                />
            </main>
        </div>
    );
};

export default AppLayout;
