import type { MusicPlatform } from '../types';

export type AppRoute =
    | { type: 'home' }
    | { type: 'explore' }
    | { type: 'library', tab: 'Songs' | 'Playlists' | 'Albums' }
    | { type: 'settings' }
    | { type: 'playlist', id: string | number }
    | { type: 'album', id: string | number, platform: MusicPlatform }
    | { type: 'artist', name: string, id?: string | number, platform: MusicPlatform };

// ================== ROUTE BUILDERS ==================

/**
 * Type-safe route builders. Use these instead of raw template literals.
 *
 * @example
 *   onNavigate(routeTo.album('netease', 123))
 *   onNavigate(routeTo.artist('qq', '周杰伦', 'abc123'))
 *   onNavigate(routeTo.playlist(456))
 */
export const routeTo = {
    home: (): string => 'Home',
    explore: (): string => 'Explore',
    settings: (): string => 'Settings',
    library: (tab: 'Songs' | 'Playlists' | 'Albums' = 'Songs'): string =>
        tab === 'Playlists' ? 'Playlists' : tab === 'Albums' ? 'Library' : 'Library',
    playlist: (id: string | number): string => `Playlist:${id}`,
    album: (platform: MusicPlatform, id: string | number): string => `Album:${platform}:${id}`,
    artist: (platform: MusicPlatform, name: string, id?: string | number): string =>
        id !== undefined ? `Artist:${platform}:${name}:${id}` : `Artist:${platform}:${name}`,
};

// ================== ROUTE PARSER ==================

export function parseRoute(activeView: string): AppRoute {
    if (activeView.startsWith('Playlist:')) {
        const id = activeView.split(':')[1];
        const numericId = parseInt(id);
        return { type: 'playlist', id: isNaN(numericId) ? id : numericId };
    }

    if (activeView.startsWith('Album:')) {
        const parts = activeView.split(':');
        if (parts.length === 3) {
            const platform = parts[1] as MusicPlatform;
            const id = parts[2];
            // Only parse as numeric if platform is netease and it's a pure number
            if (platform === 'netease' && /^\d+$/.test(id)) {
                return { type: 'album', platform, id: parseInt(id) };
            }
            return { type: 'album', platform, id };
        } else {
            const id = parts[1];
            if (/^\d+$/.test(id)) {
                return { type: 'album', platform: 'netease', id: parseInt(id) };
            }
            return { type: 'album', platform: 'netease', id };
        }
    }

    if (activeView.startsWith('Artist:')) {
        const parts = activeView.split(':');
        if (parts.length === 4) {
            const platform = parts[1] as MusicPlatform;
            const name = parts[2];
            const id = parts[3];
            if (platform === 'netease' && /^\d+$/.test(id)) {
                return { type: 'artist', platform, name, id: parseInt(id) };
            }
            return { type: 'artist', platform, name, id };
        } else if (parts.length === 3) {
            if (parts[1] === 'qq' || parts[1] === 'netease' || parts[1] === 'soda') {
                return { type: 'artist', platform: parts[1] as MusicPlatform, name: parts[2] };
            }
            const name = parts[1];
            const id = parts[2];
            if (/^\d+$/.test(id)) {
                return { type: 'artist', platform: 'netease', name, id: parseInt(id) };
            }
            return { type: 'artist', platform: 'netease', name, id };
        } else {
            const name = parts[1];
            return { type: 'artist', platform: 'netease', name };
        }
    }

    switch (activeView) {
        case 'Home': return { type: 'home' };
        case 'Explore': return { type: 'explore' };
        case 'Settings': return { type: 'settings' };
        case 'Playlists': return { type: 'library', tab: 'Playlists' };
        case 'Library':
        case 'My Music':
        default:
            return { type: 'library', tab: 'Songs' };
    }
}

