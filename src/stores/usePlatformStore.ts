import { create } from 'zustand';
import type { PlatformStore, Platform } from '../types';

const defaultPlatforms: Platform[] = [
    { name: 'NetEase Cloud', connected: true, vip: true, color: '#e60026' },
    { name: 'QQ Music', connected: true, vip: false, color: '#31c27c' },
    { name: 'Soda Music', connected: false, vip: false, color: '#ffde00' },
];

export const usePlatformStore = create<PlatformStore>((set) => ({
    platforms: defaultPlatforms,

    connectPlatform: (platformName: string) =>
        set((state) => ({
            platforms: state.platforms.map((p) =>
                p.name === platformName ? { ...p, connected: true, vip: true } : p
            ),
        })),

    disconnectPlatform: (platformName: string) =>
        set((state) => ({
            platforms: state.platforms.map((p) =>
                p.name === platformName ? { ...p, connected: false, vip: false } : p
            ),
        })),

    disconnectAll: () =>
        set((state) => ({
            platforms: state.platforms.map((p) => ({ ...p, connected: false, vip: false })),
        })),
}));
