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
    const { setQueue, setTrack } = usePlayerStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isHoveringDropzone, setIsHoveringDropzone] = useState(false);

    useEffect(() => {
        let unlistenDragDrop: () => void;
        let unlistenDrop: () => void;
        let unlistenCancelled: () => void;

        const setupListeners = async () => {
            unlistenDragDrop = await listen<{ paths: string[] }>('tauri://drag-over', () => {
                setIsHoveringDropzone(true);
            });

            unlistenDrop = await listen<{ paths: string[] }>('tauri://drop', (event) => {
                setIsHoveringDropzone(false);
                event.payload.paths.forEach(async (path) => {
                    // Check if path is a directory (simple heuristic or use another command)
                    await addFolder(path);
                });
            });

            unlistenCancelled = await listen('tauri://drag-cancelled', () => {
                setIsHoveringDropzone(false);
            });
        };

        setupListeners();

        return () => {
            if (unlistenDragDrop) unlistenDragDrop();
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

    const filteredTracks = tracks.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddFolder = async () => {
        const selected = await open({
            directory: true,
            multiple: false,
        });
        if (selected && typeof selected === 'string') {
            await addFolder(selected);
        }
    };

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            // Convert LocalTrack to the format expected by the player
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
                            className="bg-[var(--glass-highlight)]/10 backdrop-blur-md border border-[var(--glass-border)] rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)]/40 transition-all shadow-inner"
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
                {isScanning && tracks.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-[var(--main-bg)]/50 backdrop-blur-sm rounded-3xl">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-2 border-[var(--accent-color)]/20 animate-ping absolute inset-0" />
                            <div className="w-24 h-24 rounded-full border-2 border-[var(--accent-color)]/40 animate-pulse relative flex items-center justify-center">
                                <Music className="w-10 h-10 text-[var(--accent-color)] animate-bounce" />
                            </div>
                        </div>
                        <p className="text-[var(--text-secondary)] animate-pulse font-medium tracking-wide">
                            {t('local.scanning_sonar')}...
                        </p>
                    </div>
                )}

                {tracks.length === 0 && !isScanning ? (
                    /* Magnetic Drag & Drop Empty State */
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsHoveringDropzone(true); }}
                        onDragLeave={() => setIsHoveringDropzone(false)}
                        className={`w-full aspect-[21/9] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-6 transition-all duration-500 ${isHoveringDropzone
                            ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5 scale-[1.01] shadow-2xl shadow-[var(--accent-color)]/10'
                            : 'border-[var(--glass-border)] bg-[var(--glass-highlight)]/5'
                            }`}
                    >
                        <div className={`p-6 rounded-3xl bg-[var(--glass-highlight)]/10 transition-transform duration-700 ${isHoveringDropzone ? 'scale-110 rotate-6' : ''}`}>
                            <FolderPlus className={`w-12 h-12 ${isHoveringDropzone ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-[var(--text-main)] mb-2">
                                {t('local.no_tracks_title')}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm max-w-sm">
                                {t('local.no_tracks_desc')}
                            </p>
                        </div>
                        <button
                            onClick={handleAddFolder}
                            className="text-[var(--accent-color)] text-sm font-medium px-6 py-2 rounded-full border border-[var(--accent-color)]/20 hover:bg-[var(--accent-color)]/5 transition-all"
                        >
                            {t('local.browse_files')}
                        </button>
                    </div>
                ) : (
                    /* Dynamic Audio Wall (Grid Layout) */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredTracks.map((track, index) => (
                            <motion.div
                                key={track.id as string}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05, duration: 0.5 }}
                                className="group relative flex flex-col gap-3 cursor-pointer"
                                onClick={() => {
                                    const playerTracks = filteredTracks.map(t => ({
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
                                        setQueue(playerTracks);
                                        setTrack(selectedTrack);
                                    }
                                }}
                            >
                                <div className="aspect-square relative overflow-hidden rounded-2xl bg-[var(--glass-highlight)] shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[var(--accent-color)]/20 group-hover:-translate-y-1">
                                    {track.cover ? (
                                        <img
                                            src={track.cover}
                                            alt={track.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--accent-color)]/20 to-[var(--accent-color)]/5">
                                            <Music className="w-12 h-12 text-[var(--accent-color)] opacity-20" />
                                        </div>
                                    )}

                                    {/* Glass Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-500 border border-white/30">
                                            <Play className="w-6 h-6 fill-current" />
                                        </div>
                                    </div>

                                    {/* High-Res Tag */}
                                    {track.size > 20 * 1024 * 1024 && (
                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-yellow-500/80 text-white text-[10px] font-bold rounded uppercase tracking-tighter shadow-sm">
                                            Hi-Res
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-0.5 px-1">
                                    <h4 className="text-sm font-medium text-[var(--text-main)] truncate group-hover:text-[var(--accent-color)] transition-colors">
                                        {track.title}
                                    </h4>
                                    <p className="text-xs text-[var(--text-secondary)] truncate">
                                        {track.artist}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocalMusicView;
