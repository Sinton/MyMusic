import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import { SmartMatchService } from '../services/SmartMatchService';
import localforage from 'localforage';

localforage.config({
    name: 'vibe-music',
    storeName: 'local_music_store'
});

export interface LocalTrack {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    path: string;
    cover: string | null;
    size: number;
    platform?: string;
}

interface LocalMusicState {
    folders: string[];
    tracks: LocalTrack[];
    isScanning: boolean;
    scanningCount: number;
    lastScanTime: number | null;

    // Actions
    addFolder: (path: string) => Promise<void>;
    addFolders: (paths: string[]) => Promise<void>;
    removeFolder: (path: string) => void;
    scanAll: () => Promise<void>;
    clearTracks: () => void;
}

export const useLocalMusicStore = create<LocalMusicState>()(
    persist(
        (set, get) => ({
            folders: [],
            tracks: [],
            isScanning: false,
            scanningCount: 0,
            lastScanTime: null,

            addFolder: async (path: string) => {
                await get().addFolders([path]);
            },

            addFolders: async (paths: string[]) => {
                const { folders } = get();
                const newFolders = paths.filter(path => !folders.includes(path));

                if (newFolders.length > 0) {
                    set({ folders: [...folders, ...newFolders] });
                    // Trigger a scan for the new folders
                    await get().scanAll();
                }
            },

            removeFolder: (path: string) => {
                set({ folders: get().folders.filter(f => f !== path) });
            },

            scanAll: async () => {
                const { folders, isScanning } = get();
                if (isScanning || folders.length === 0) return;

                console.log('[Local Music] Starting scan for folders:', folders);
                set({ isScanning: true, scanningCount: 0 });

                try {
                    let allTracks: LocalTrack[] = [];

                    for (const folder of folders) {
                        console.log(`[Local Music] Scanning folder: ${folder}`);
                        const response = await invoke<any>('request_api_gateway', {
                            provider: 'local',
                            apiName: 'scan',
                            params: `directory=${encodeURIComponent(folder)}`,
                            cookie: '',
                            traceId: Math.random().toString(36).substring(7)
                        });

                        if (response && response.type === 'Raw' && response.data && response.data.tracks) {
                            const newTracks = response.data.tracks;
                            allTracks = [...allTracks, ...newTracks];
                            // Incremental update to show "found" count
                            set({ scanningCount: allTracks.length });
                        }
                    }

                    console.log(`[Local Music] Total tracks found: ${allTracks.length}`);

                    // Remove duplicates by path
                    const uniqueTracks = Array.from(new Map(allTracks.map(t => [t.path, t])).values());

                    // Initial set to show them immediately
                    set({ tracks: uniqueTracks });

                    // Smart Match Enrichment (Parallel)
                    const enrichedTracks = await Promise.all(uniqueTracks.map(async (track, index) => {
                        if (!track.cover) {
                            try {
                                const match = await SmartMatchService.findMatch(track);
                                if (match) {
                                    const enriched = { ...track, cover: match.cover };
                                    // Optionally update incrementally but might be too many renders
                                    return enriched;
                                }
                            } catch (e) {
                                console.warn('[Local Music] Smart Match failed for:', track.title, e);
                            }
                        }
                        return track;
                    }));

                    set({
                        tracks: enrichedTracks,
                        isScanning: false,
                        scanningCount: 0,
                        lastScanTime: Date.now()
                    });
                } catch (error) {
                    console.error('Failed to scan folders:', error);
                    set({ isScanning: false, scanningCount: 0 });
                }
            },

            clearTracks: () => set({ tracks: [] }),
        }),
        {
            name: 'vibe-local-music-storage',
            storage: {
                getItem: async (name: string): Promise<string | null> => {
                    return await localforage.getItem(name);
                },
                setItem: async (name: string, value: string): Promise<void> => {
                    await localforage.setItem(name, value);
                },
                removeItem: async (name: string): Promise<void> => {
                    await localforage.removeItem(name);
                },
            },
            partialize: (state) => ({
                folders: state.folders,
                tracks: state.tracks,
                lastScanTime: state.lastScanTime
            }),
        }
    )
);
