import React, { useState, useEffect } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { usePlaylistStore } from '../../stores/usePlaylistStore';
import { useUIStore } from '../../stores/useUIStore';
import { useNeteaseLyric } from '../../hooks/useNeteaseData';
import { isNeteasePlatform } from '../../lib/platformUtils';
import { mockComments, mockLyrics } from '../../data/mockData';

// Sub-components
import VinylVisualizer from './VinylVisualizer';
import LyricsPanel from './LyricsPanel';
import PlaybackControls from './PlaybackControls';
import CommentsPanel from './CommentsPanel';
import QueuePanel from './QueuePanel';
import OptionsPanel from './OptionsPanel';

interface FullScreenPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: (view: string) => void;
}

const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({ isOpen, onClose, onNavigate }) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    // UI Store State & Actions
    const {
        visualizerEnabled,
        showCommentsPanel,
        showOptionsPanel,
        showQueuePanel,
        toggleCommentsPanel,
        toggleOptionsPanel,
        toggleQueuePanel
    } = useUIStore();

    const {
        isPlaying,
        togglePlay,
        currentTrack,
        nextTrack,
        previousTrack,
        currentTimeSec,
        durationSec,
        setProgress,
        queue,
        setTrack,
        play,
        shuffle,
        repeat,
        toggleMode
    } = usePlayerStore();

    const { userPlaylists, addSongToPlaylist } = usePlaylistStore();

    // Use real lyrics for NetEase tracks, fallback to mockLyrics
    const isNetease = isNeteasePlatform(currentTrack.source);
    const { lyrics: neteaseLyrics } = useNeteaseLyric(currentTrack.id, { enabled: isNetease && !!currentTrack.id });
    const activeLyrics = (isNetease && neteaseLyrics.length > 0) ? neteaseLyrics : mockLyrics;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        setProgress(Math.floor(percent * durationSec));
    };

    const handlePlayQueueTrack = (track: typeof currentTrack) => {
        setTrack(track);
        play();
    };

    // Close all panels when player closes or opens
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col bg-[var(--bg-color)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        >
            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-8 py-6">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                    <ChevronDown className="w-6 h-6 text-[var(--text-main)]" />
                </button>
                <div className="text-sm font-medium tracking-wide text-[var(--text-secondary)] uppercase">{t('fullPlayer.nowPlaying')}</div>
                <button
                    onClick={toggleOptionsPanel}
                    className={`p-2 rounded-full transition-colors ${showOptionsPanel ? 'bg-white/10' : 'hover:bg-white/10'}`}
                >
                    <MoreHorizontal className="w-6 h-6 text-[var(--text-main)]" />
                </button>
            </div>

            {/* Main Content: 50/50 Split */}
            <div className="relative z-10 flex-1 flex items-center px-12">
                {/* Left side - Vinyl */}
                <div className="flex-1 flex justify-center items-center h-full pr-10">
                    <VinylVisualizer
                        isPlaying={isPlaying}
                        visualizerEnabled={visualizerEnabled}
                        trackId={currentTrack.id}
                    />
                </div>

                {/* Right side - Track Info & Lyrics */}
                <div className="flex-1 flex flex-col justify-center items-start h-full pl-20 overflow-hidden">
                    <div className="max-w-xl w-full">
                        <h1 className="text-4xl font-bold text-[var(--text-main)] mb-2">{currentTrack.title}</h1>
                        <h2 className="text-2xl text-[var(--accent-color)] mb-8">{currentTrack.artist} - {currentTrack.album}</h2>

                        <LyricsPanel
                            lyrics={activeLyrics}
                            currentTimeSec={currentTimeSec}
                            onSeek={setProgress}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <PlaybackControls
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                shuffle={shuffle}
                repeat={repeat}
                currentTimeSec={currentTimeSec}
                durationSec={durationSec}
                showComments={showCommentsPanel}
                showQueue={showQueuePanel}
                onTogglePlay={togglePlay}
                onNextTrack={nextTrack}
                onPreviousTrack={previousTrack}
                onToggleMode={toggleMode}
                onSeek={handleSeek}
                onToggleComments={toggleCommentsPanel}
                onToggleQueue={toggleQueuePanel}
            />

            {/* Sidebars */}
            <CommentsPanel
                isOpen={showCommentsPanel}
                onClose={toggleCommentsPanel}
                comments={mockComments}
            />

            <QueuePanel
                isOpen={showQueuePanel}
                onClose={toggleQueuePanel}
                queue={queue}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayQueueTrack}
            />

            <OptionsPanel
                isOpen={showOptionsPanel}
                onClose={toggleOptionsPanel}
                currentTrack={currentTrack}
                userPlaylists={userPlaylists}
                onAddToPlaylist={addSongToPlaylist}
                onNavigate={(view) => {
                    onNavigate?.(view);
                    onClose();
                }}
            />
        </div>
    );
};

export default FullScreenPlayer;
