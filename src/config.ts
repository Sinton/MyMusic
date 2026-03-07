/**
 * Global application configuration
 */
export const APP_CONFIG = {
    cache: {
        /**
         * How long the comment data stays fresh (in milliseconds)
         * Default: 5 minutes
         */
        commentsStaleTime: 1000 * 60 * 5,
    },
};

export const ACCENT_COLORS = {
    green: '#10b981',
    netease: '#e60026',
    orange_yellow: '#ffcc00',
    blue: '#3b82f6',
    orange: '#f97316',
    purple: '#8b5cf6',
    pink: '#ec4899',
} as const;

export type AccentColorKey = keyof typeof ACCENT_COLORS;

export const ACCENT_COLOR_ORDER: AccentColorKey[] = [
    'green',
    'netease',
    'orange_yellow',
    'blue',
    'orange',
    'purple',
    'pink',
];
