import React, { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { TitleBar } from '../components/common/TitleBar';
import Sidebar from './Sidebar';
import MainView from './MainView';
import { PlayerBar } from '../components/player';
import AudioEngine from '../components/core/AudioEngine';
import { FullScreenPlayer } from '../components/player';
import { AuthModal } from '../components';
import { usePlatformStore } from '../stores/usePlatformStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import ClipboardMusicToast from '../components/common/ClipboardMusicToast';
import { useClipboardMonitor, type ClipboardTrackInfo } from '../hooks/useClipboardMonitor';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { useQQStore } from '../stores/useQQStore';

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

    // Clipboard monitoring
    const [clipboardInfo, setClipboardInfo] = useState<ClipboardTrackInfo | null>(null);

    const handleClipboardDetect = useCallback((info: ClipboardTrackInfo) => {
        setClipboardInfo(info);
    }, []);

    useClipboardMonitor(handleClipboardDetect);

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
    }, [currentTrack.songId]);



    const neteaseStore = useNeteaseStore();
    const qqStore = useQQStore();
    const connectPlatform = usePlatformStore((state) => state.connectPlatform);

    // Sync platform connection state on mount
    React.useEffect(() => {
        if (neteaseStore.isLoggedIn) {
            connectPlatform('NetEase Cloud');
        }
        if (qqStore.isLoggedIn) {
            connectPlatform('QQ Music');
        }
    }, []);

    const handleConnect = (platformName: string) => {
        connectPlatform(platformName);
    };

    return (
        <div className="flex w-screen h-screen overflow-hidden text-[var(--text-main)] font-sans antialiased selection:bg-[var(--accent-color)] selection:text-white">
            <Sidebar
                activeView={activeView}
                onNavigate={handleNavigate}
                onOpenAuth={openAuthModal}
            />
            <main className="flex-1 relative flex flex-col min-w-0">
                <TitleBar canGoBack={history.length > 1} onBack={handleBack} isTransparent={isFullScreenPlayerOpen} />
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

                {/* Clipboard Music Toast */}
                <ClipboardMusicToast
                    info={clipboardInfo}
                    onDismiss={() => setClipboardInfo(null)}
                />
            </main>
        </div>
    );
};

export default AppLayout;

