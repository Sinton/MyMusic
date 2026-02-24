import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NeteaseUser {
    userId: number;
    nickname: string;
    avatarUrl: string;
    vipType: number;
}

interface NeteaseState {
    // Login state
    isLoggedIn: boolean;
    cookie: string;
    user: NeteaseUser | null;

    // QR login state
    qrKey: string;
    qrUrl: string;
    qrStatus: 'idle' | 'waiting' | 'scanned' | 'confirmed' | 'expired' | 'error';

    // Actions
    setCookie: (cookie: string) => void;
    setUser: (user: NeteaseUser) => void;
    setLoggedIn: (loggedIn: boolean) => void;
    setQrKey: (key: string) => void;
    setQrUrl: (url: string) => void;
    setQrStatus: (status: NeteaseState['qrStatus']) => void;
    logout: () => void;
    reset: () => void;
}

export const useNeteaseStore = create<NeteaseState>()(
    persist(
        (set) => ({
            isLoggedIn: false,
            cookie: '',
            user: null,
            qrKey: '',
            qrUrl: '',
            qrStatus: 'idle',

            setCookie: (cookie: string) => set({ cookie }),
            setUser: (user: NeteaseUser) => set({ user }),
            setLoggedIn: (loggedIn: boolean) => set({ isLoggedIn: loggedIn }),
            setQrKey: (key: string) => set({ qrKey: key }),
            setQrUrl: (url: string) => set({ qrUrl: url }),
            setQrStatus: (status: NeteaseState['qrStatus']) => set({ qrStatus: status }),
            logout: () => set({
                isLoggedIn: false,
                cookie: '',
                user: null,
                qrKey: '',
                qrUrl: '',
                qrStatus: 'idle',
            }),
            reset: () => set({
                qrKey: '',
                qrUrl: '',
                qrStatus: 'idle',
            }),
        }),
        {
            name: 'netease-storage',
            // Only persist login-related state, not QR temp state
            partialize: (state) => ({
                isLoggedIn: state.isLoggedIn,
                cookie: state.cookie,
                user: state.user,
            }),
        }
    )
);
