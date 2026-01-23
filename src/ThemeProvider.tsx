import React, { useEffect } from 'react';
import { useSettingsStore } from './stores/useSettingsStore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { themeMode, accentColor } = useSettingsStore();

    // Handle Theme Mode (Dark/Light/System)
    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (isDark: boolean) => {
            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        if (themeMode === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches);

            const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        } else {
            applyTheme(themeMode === 'dark');
        }
    }, [themeMode]);

    // Handle Accent Color
    useEffect(() => {
        const root = window.document.documentElement;
        const colors = {
            pink: '#ec4899',
            purple: '#8b5cf6',
            blue: '#3b82f6',
            green: '#10b981',
            orange: '#f97316'
        };
        root.style.setProperty('--accent-color', colors[accentColor]);
    }, [accentColor]);

    return <>{children}</>;
};
