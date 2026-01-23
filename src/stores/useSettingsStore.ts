import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'dark' | 'light' | 'system';
type AccentColor = 'pink' | 'purple' | 'blue' | 'green' | 'orange';

interface SettingsState {
    // Appearance
    themeMode: ThemeMode;
    accentColor: AccentColor;
    setThemeMode: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColor) => void;

    // General
    language: string;
    launchOnLogin: boolean;
    setLanguage: (lang: string) => void;
    toggleLaunchOnLogin: () => void;

    // Audio
    outputDevice: string;
    streamingQuality: string;
    exclusiveMode: boolean;
    setOutputDevice: (device: string) => void;
    setStreamingQuality: (quality: string) => void;
    toggleExclusiveMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            themeMode: 'dark',
            accentColor: 'pink',
            language: 'en',
            launchOnLogin: true,
            outputDevice: 'default',
            streamingQuality: 'master',
            exclusiveMode: false,

            setThemeMode: (mode) => set({ themeMode: mode }),
            setAccentColor: (color) => set({ accentColor: color }),

            setLanguage: (lang) => set({ language: lang }),
            toggleLaunchOnLogin: () => set((state) => ({ launchOnLogin: !state.launchOnLogin })),

            setOutputDevice: (device) => set({ outputDevice: device }),
            setStreamingQuality: (quality) => set({ streamingQuality: quality }),
            toggleExclusiveMode: () => set((state) => ({ exclusiveMode: !state.exclusiveMode })),
        }),
        {
            name: 'settings-storage',
        }
    )
);
