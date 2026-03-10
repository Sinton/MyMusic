import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FolderPlus,
    Search,
    Music,
    RefreshCw,
    Trash2,
    MoreVertical,
    Folder,
    Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listen } from '@tauri-apps/api/event';
import { useLocalMusicStore } from '../stores/useLocalMusicStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { open } from '@tauri-apps/plugin-dialog';
import { formatTime } from '../lib/playerUtils';
import MagneticDropzone from '../components/local/MagneticDropzone';
import SonarScanner from '../components/local/SonarScanner';
import GravitationalGrid from '../components/local/GravitationalGrid';
import WaveformScrubber from '../components/local/WaveformScrubber';
import { useLocalCoverUrl } from '../hooks/useLocalCoverUrl';

const LocalMusicView: React.FC = () => {
    const { t } = useTranslation();
    const {
        folders,
        tracks,
        isScanning,
        addFolder,
        removeFolder,
        scanAll,
        lastScanTime
    } = useLocalMusicStore();
    const {
        currentTrack,
        isPlaying,
        currentTimeSec,
        durationSec,
        queue,
        setQueue,
        setTrack,
        setProgress
    } = usePlayerStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isHoveringDropzone, setIsHoveringDropzone] = useState(false);
    const [dragPosition, setDragPosition] = useState<{ x: number, y: number } | null>(null);

    const isLocalTrackPlaying = currentTrack?.platform === 'local' || (currentTrack?.source && (currentTrack.source.startsWith('C:') || currentTrack.source.includes('/') || currentTrack.source.includes('\\')));

    // Resolve cover url dynamically
    // If it's a proxy placeholder ('local_cover'), we need the port. currentTrack.source acts as path.
    const resolvedCurrentCover = useLocalCoverUrl(
        currentTrack.cover || tracks.find(t => t.id === currentTrack.songId)?.cover,
        currentTrack.source || tracks.find(t => t.id === currentTrack.songId)?.path
    );

    useEffect(() => {
        let unlistenDragDrop: () => void;
        let unlistenDrop: () => void;
        let unlistenCancelled: () => void;
        let unlistenDragOver: () => void; // Declare unlistenDragOver here

        const setupListeners = async () => {
            unlistenDragDrop = await listen<{ paths: string[], position: { x: number, y: number } }>('tauri://drag-enter', (event) => {
                setIsHoveringDropzone(true);
                setDragPosition(event.payload.position);
            });

            unlistenDragOver = await listen<{ paths: string[], position: { x: number, y: number } }>('tauri://drag-over', (event) => {
                setDragPosition(event.payload.position);
            });

            unlistenDrop = await listen<{ paths: string[] }>('tauri://drag-drop', async (event) => {
                setIsHoveringDropzone(false);
                setDragPosition(null);
                if (event.payload && Array.isArray(event.payload.paths)) {
                    const { addFolder } = useLocalMusicStore.getState();
                    for (const path of event.payload.paths) {
                        await addFolder(path);
                    }
                }
            });

            unlistenCancelled = await listen('tauri://drag-leave', () => {
                setIsHoveringDropzone(false);
                setDragPosition(null);
            });

            return () => {
                unlistenDragDrop?.();
                unlistenDragOver?.();
                unlistenDrop?.();
                unlistenCancelled?.();
            };
        };

        setupListeners();

        return () => {
            if (unlistenDragDrop) unlistenDragDrop();
            if (unlistenDragOver) unlistenDragOver(); // Cleanup unlistenDragOver
            if (unlistenDrop) unlistenDrop();
            if (unlistenCancelled) unlistenCancelled();
        };
    }, [addFolder]);

    useEffect(() => {
        // Auto-scan on mount if tracks are empty but folders exist
        if (tracks.length === 0 && folders.length > 0 && !isScanning) {
            scanAll();
        }
    }, []);

    const addFolders = async (paths: string[]) => {
        const { addFolder } = useLocalMusicStore.getState();
        for (const path of paths) {
            await addFolder(path);
        }
    };

    const openFolderDialog = async () => {
        const selected = await open({
            directory: true,
            multiple: false,
        });
        if (selected && typeof selected === 'string') {
            await addFolder(selected);
        }
    };

    const handleAddFolder = async () => {
        await openFolderDialog();
    };

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            const playerTracks = tracks.map(t => ({
                songId: t.id,
                title: t.title,
                artist: t.artist,
                album: t.album,
                duration: formatTime(t.duration),
                currentTime: '0:00',
                cover: t.cover || '',
                source: t.path,
                quality: 'SQ',
                platform: (t.platform as any) || 'local'
            }));
            setQueue(playerTracks);
            setTrack(playerTracks[0]);
        }
    };

    const handleTrackClick = (track: any, trackList: any[]) => {
        const playerTracks = trackList.map(t => ({
            songId: t.id,
            title: t.title,
            artist: t.artist,
            album: t.album,
            duration: formatTime(t.duration),
            currentTime: '0:00',
            cover: t.cover || '',
            source: t.path,
            quality: 'SQ',
            platform: (t.platform as any) || 'local'
        }));
        const selectedTrack = playerTracks.find(pt => pt.songId === track.id);
        if (selectedTrack) {
            const exists = queue.some(t => t.songId === selectedTrack.songId);
            if (!exists) {
                setQueue([...queue, selectedTrack]);
            }
            setTrack(selectedTrack);
        }
    };

    const filteredTracks = tracks.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-[var(--text-main)] tracking-tight">
                        {t('sidebar.local')}
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm flex items-center gap-2">
                        <Folder className="w-4 h-4 opacity-50" />
                        {folders.length} {t('local.folders_connected')}
                        {lastScanTime && (
                            <span className="opacity-50">• {t('local.last_synced')}: {new Date(lastScanTime).toLocaleString()}</span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent-color)] transition-colors" />
                        <input
                            type="text"
                            placeholder={t('local.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[var(--glass-highlight)]/40 backdrop-blur-2xl border border-[var(--glass-border)] rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)]/40 transition-all shadow-inner"
                        />
                    </div>
                    <button
                        onClick={handleAddFolder}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-white rounded-full text-sm font-medium hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--accent-color)]/20"
                    >
                        <FolderPlus className="w-4 h-4" />
                        {t('local.add_folder')}
                    </button>
                    <button
                        onClick={() => {
                            if (folders.length === 0) {
                                handleAddFolder();
                            } else {
                                scanAll();
                            }
                        }}
                        disabled={isScanning}
                        className={`p-2 rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-highlight)] transition-all ${isScanning ? 'animate-spin' : ''}`}
                        title={folders.length === 0 ? t('local.add_folder') : t('common.retryButton')}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Folder Connection Pills */}
            <AnimatePresence>
                {folders.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-wrap gap-2"
                    >
                        {folders.map(folder => (
                            <div key={folder} className="group flex items-center gap-2 px-3 py-1.5 bg-[var(--glass-highlight)]/30 border border-[var(--glass-border)] rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--glass-highlight)] transition-colors">
                                <span className="max-w-[200px] truncate">{folder}</span>
                                <button
                                    onClick={() => removeFolder(folder)}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="relative min-h-[400px]">
                <AnimatePresence>
                    {isScanning && (
                        <SonarScanner
                            isScanning={isScanning}
                            foundCount={useLocalMusicStore.getState().scanningCount}
                        />
                    )}
                </AnimatePresence>

                {isLocalTrackPlaying && tracks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 p-8 rounded-3xl bg-[var(--glass-highlight)]/5 border border-white/5 backdrop-blur-xl relative overflow-hidden group"
                    >
                        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                            <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl relative">
                                {resolvedCurrentCover ? (
                                    <img src={resolvedCurrentCover} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[var(--accent-color)]/20 flex items-center justify-center">
                                        <Music className="w-16 h-16 text-[var(--accent-color)]" />
                                    </div>
                                )}
                                {isPlaying && (
                                    <div className="absolute bottom-2 right-2">
                                        <div className="flex gap-1 items-end h-4">
                                            {[1, 2, 3, 4].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: [4, 16, 4] }}
                                                    transition={{ duration: 0.5 + i * 0.1, repeat: Infinity }}
                                                    className="w-1 bg-[var(--accent-color)] rounded-full"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-[var(--text-main)] mb-1">{currentTrack.title}</h2>
                                    <p className="text-[var(--text-secondary)] text-lg">{currentTrack.artist} — {currentTrack.album}</p>
                                </div>

                                <WaveformScrubber
                                    src={currentTrack.source}
                                    duration={durationSec}
                                    currentTime={currentTimeSec}
                                    onSeek={setProgress}
                                />

                                <div className="flex justify-between text-xs font-mono text-[var(--text-muted)] opacity-50">
                                    <span>{formatTime(currentTimeSec)}</span>
                                    <span>{currentTrack.duration}</span>
                                </div>
                            </div>
                        </div>

                        {/* Background Fluid Decoration */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent-color)]/10 blur-[100px] rounded-full group-hover:bg-[var(--accent-color)]/20 transition-all duration-1000" />
                    </motion.div>
                )}

                {tracks.length === 0 && !isScanning ? (
                    <MagneticDropzone
                        onDrop={addFolders}
                        onBrowse={openFolderDialog}
                        isExternalHover={isHoveringDropzone}
                        externalPos={dragPosition}
                    />
                ) : (
                    <GravitationalGrid
                        tracks={filteredTracks}
                        onTrackClick={handleTrackClick}
                    />
                )}
            </div>
        </div>
    );
};

export default LocalMusicView;
