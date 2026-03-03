import { create } from 'zustand';
import type { UIStore } from '../types';

export const useUIStore = create<UIStore>((set) => ({
    // ================== STATE ==================
    // Player UI
    visualizerEnabled: true,
    isFullScreenPlayerOpen: false,
    showQueuePanel: false,
    showCommentsPanel: false,
    showOptionsPanel: false,

    // Modal UI
    authModalOpen: false,
    authModalTarget: null,
    createPlaylistModalOpen: false,

    // ================== ACTIONS ==================
    // Player UI Actions
    toggleVisualizer: () => set((state) => ({ visualizerEnabled: !state.visualizerEnabled })),

    openFullScreenPlayer: () => set({ isFullScreenPlayerOpen: true }),
    closeFullScreenPlayer: () => set({ isFullScreenPlayerOpen: false }),

    toggleQueuePanel: () => set((state) => ({
        showQueuePanel: !state.showQueuePanel,
        showCommentsPanel: false,
        showOptionsPanel: false
    })),
    toggleCommentsPanel: () => set((state) => ({
        showCommentsPanel: !state.showCommentsPanel,
        showQueuePanel: false,
        showOptionsPanel: false
    })),
    toggleOptionsPanel: () => set((state) => ({
        showOptionsPanel: !state.showOptionsPanel,
        showQueuePanel: false,
        showCommentsPanel: false
    })),

    closeAllPanels: () => set({
        showQueuePanel: false,
        showCommentsPanel: false,
        showOptionsPanel: false
    }),

    // Modal UI Actions
    openAuthModal: (platform) => set({
        authModalOpen: true,
        authModalTarget: platform
    }),
    closeAuthModal: () => set({
        authModalOpen: false,
        authModalTarget: null
    }),

    openCreatePlaylistModal: () => set({ createPlaylistModalOpen: true }),
    closeCreatePlaylistModal: () => set({ createPlaylistModalOpen: false }),
}));
