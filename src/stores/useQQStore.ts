import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QQUser } from '../types/api/qq';

interface QQStore {
    cookie: string;
    user: QQUser | null;
    isLoggedIn: boolean;

    setCookie: (cookie: string) => void;
    setUser: (user: QQUser | null) => void;
    setLoggedIn: (isLoggedIn: boolean) => void;
    logout: () => void;
}

export const useQQStore = create<QQStore>()(
    persist(
        (set) => ({
            cookie: '',
            user: null,
            isLoggedIn: false,

            setCookie: (cookie) => set({ cookie }),
            setUser: (user) => set({ user }),
            setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
            logout: () => set({ cookie: '', user: null, isLoggedIn: false }),
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
