import type { Platform } from '../domain/general';

// --- Settings Domain State (persisted) ---
export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'pink' | 'purple' | 'blue' | 'green' | 'orange';

export interface SettingsState {
    themeMode: ThemeMode;
    accentColor: AccentColor;
    language: string;
    launchOnLogin: boolean;
    outputDevice: string;
    streamingQuality: string;
    exclusiveMode: boolean;
    immersiveHeader: boolean;
    globalSearchShortcut: string;
    clipboardMonitor: boolean;
}

export interface SettingsActions {
    setThemeMode: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColor) => void;
    setLanguage: (lang: string) => void;
    toggleLaunchOnLogin: () => void;
    setOutputDevice: (device: string) => void;
    setStreamingQuality: (quality: string) => void;
    toggleExclusiveMode: () => void;
    toggleImmersiveHeader: () => void;
    setGlobalSearchShortcut: (shortcut: string) => void;
    toggleClipboardMonitor: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

// --- UI Store (Transient) ---
export interface UIState {
    // Player UI
    visualizerEnabled: boolean;
    isFullScreenPlayerOpen: boolean;
    showQueuePanel: boolean;
    showCommentsPanel: boolean;
    showOptionsPanel: boolean;

    // Modal UI
    authModalOpen: boolean;
    authModalTarget: Platform | null;
    createPlaylistModalOpen: boolean;
}

export interface UIActions {
    // Player UI
    toggleVisualizer: () => void;
    openFullScreenPlayer: () => void;
    closeFullScreenPlayer: () => void;
    toggleQueuePanel: () => void;
    toggleCommentsPanel: () => void;
    toggleOptionsPanel: () => void;
    closeAllPanels: () => void;

    // Modal UI
    openAuthModal: (platform: Platform) => void;
    closeAuthModal: () => void;
    openCreatePlaylistModal: () => void;
    closeCreatePlaylistModal: () => void;
}

export type UIStore = UIState & UIActions;
