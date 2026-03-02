export type AppRoute =
    | { type: 'home' }
    | { type: 'explore' }
    | { type: 'library', tab: 'Songs' | 'Playlists' | 'Albums' }
    | { type: 'settings' }
    | { type: 'playlist', id: string | number }
    | { type: 'album', id: string | number, platform: string }
    | { type: 'artist', name: string, id?: string | number, platform: string };

export function parseRoute(activeView: string): AppRoute {
    if (activeView.startsWith('Playlist:')) {
        const id = activeView.split(':')[1];
        const numericId = parseInt(id);
        return { type: 'playlist', id: isNaN(numericId) ? id : numericId };
    }

    if (activeView.startsWith('Album:')) {
        const parts = activeView.split(':');
        if (parts.length === 3) {
            const platform = parts[1];
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
            const platform = parts[1];
            const name = parts[2];
            const id = parts[3];
            if (platform === 'netease' && /^\d+$/.test(id)) {
                return { type: 'artist', platform, name, id: parseInt(id) };
            }
            return { type: 'artist', platform, name, id };
        } else if (parts.length === 3) {
            if (parts[1] === 'qq' || parts[1] === 'netease') {
                return { type: 'artist', platform: parts[1], name: parts[2] };
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
