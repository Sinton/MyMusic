import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QQUser } from '../types/api/qq';

interface QQStore {
    cookie: string;
    user: QQUser | null;
    isLoggedIn: boolean;
    qrStatus: 'idle' | 'waiting' | 'scanned' | 'confirmed' | 'expired' | 'error';

    setCookie: (cookie: string) => void;
    setUser: (user: QQUser | null) => void;
    setLoggedIn: (isLoggedIn: boolean) => void;
    setQrStatus: (status: QQStore['qrStatus']) => void;
    logout: () => void;
}

export const useQQStore = create<QQStore>()(
    persist(
        (set) => ({
            cookie: '',
            user: null,
            isLoggedIn: false,
            qrStatus: 'idle',

            setCookie: (cookie) => set({ cookie }),
            setUser: (user) => set({ user }),
            setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
            setQrStatus: (status) => set({ qrStatus: status }),
            logout: () => set({ cookie: '', user: null, isLoggedIn: false, qrStatus: 'idle' }),
        }),
        {
            name: 'qq-storage',
            partialize: (state) => ({
                cookie: state.cookie,
                user: state.user,
                isLoggedIn: state.isLoggedIn
            }),
        }
    )
);
