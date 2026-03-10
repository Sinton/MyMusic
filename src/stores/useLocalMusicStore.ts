import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import { SmartMatchService } from '../services/SmartMatchService';

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
    lastScanTime: number | null;

    // Actions
    addFolder: (path: string) => Promise<void>;
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
            lastScanTime: null,

            addFolder: async (path: string) => {
                const { folders } = get();
                if (!folders.includes(path)) {
                    set({ folders: [...folders, path] });
                    // Trigger a scan for the new folder
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
                set({ isScanning: true });

                try {
                    let allTracks: LocalTrack[] = [];

                    for (const folder of folders) {
                        console.log(`[Local Music] Scanning folder: ${folder}`);
                        // Call the Tauri backend API we just created
                        // Note: provider="local", api_name="scan", options={ params: "directory=..." }
                        const response = await invoke<any>('request_api_gateway', {
                            provider: 'local',
                            apiName: 'scan',
                            params: `directory=${encodeURIComponent(folder)}`,
                            cookie: '',
                            traceId: Math.random().toString(36).substring(7)
                        });

                        const trackCount = response?.data?.tracks?.length || 0;
                        console.log(`[Local Music] Found ${trackCount} tracks in: ${folder}`);

                        if (response && response.type === 'Raw' && response.data && response.data.tracks) {
                            allTracks = [...allTracks, ...response.data.tracks];
                        }
                    }

                    console.log(`[Local Music] Total tracks found: ${allTracks.length}`);

                    // Remove duplicates by path
                    const uniqueTracks = Array.from(new Map(allTracks.map(t => [t.path, t])).values());

                    set({ tracks: uniqueTracks });

                    // Smart Match Enrichment (Parallel)
                    const enrichedTracks = await Promise.all(uniqueTracks.map(async track => {
                        if (!track.cover) {
                            try {
                                const match = await SmartMatchService.findMatch(track);
                                if (match) {
                                    return { ...track, cover: match.cover };
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
                        lastScanTime: Date.now()
                    });
                } catch (error) {
                    console.error('Failed to scan folders:', error);
                    set({ isScanning: false });
                }
            },

            clearTracks: () => set({ tracks: [] }),
        }),
        {
            name: 'vibe-local-music-storage',
            partialize: (state) => ({
                folders: state.folders,
                tracks: state.tracks,
                lastScanTime: state.lastScanTime
            }),
        }
    )
);
