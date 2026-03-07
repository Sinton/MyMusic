import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SettingsStore } from '../types';

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            themeMode: 'dark',
            accentColor: 'pink',
            language: 'en',
            launchOnLogin: true,
            outputDevice: 'default',
            streamingQuality: 'master',
            exclusiveMode: false,
            immersiveHeader: true,
            globalSearchShortcut: 'Shift+F',
            clipboardMonitor: true,
            developerMode: false,

            setThemeMode: (mode) => set({ themeMode: mode }),
            setAccentColor: (color) => set({ accentColor: color }),

            setLanguage: (lang) => {
                set({ language: lang });
                import('../locales/i18n').then(({ default: i18n }) => {
                    i18n.changeLanguage(lang);
                });
            },
            toggleLaunchOnLogin: () => set((state) => ({ launchOnLogin: !state.launchOnLogin })),

            setOutputDevice: (device) => set({ outputDevice: device }),
            setStreamingQuality: (quality) => set({ streamingQuality: quality }),
            toggleExclusiveMode: () => set((state) => ({ exclusiveMode: !state.exclusiveMode })),
            toggleImmersiveHeader: () => set((state) => ({ immersiveHeader: !state.immersiveHeader })),
            setGlobalSearchShortcut: (shortcut) => set({ globalSearchShortcut: shortcut }),
            toggleClipboardMonitor: () => set((state) => ({ clipboardMonitor: !state.clipboardMonitor })),
            toggleDeveloperMode: () => set((state) => ({ developerMode: !state.developerMode })),
        }),
        {
            name: 'settings-storage',
        }
    )
);
