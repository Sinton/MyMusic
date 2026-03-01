export type AppRoute =
    | { type: 'home' }
    | { type: 'explore' }
    | { type: 'library', tab: 'Songs' | 'Playlists' | 'Albums' }
    | { type: 'settings' }
    | { type: 'playlist', id: number }
    | { type: 'album', id: number }
    | { type: 'artist', name: string, id?: number };

export function parseRoute(activeView: string): AppRoute {
    if (activeView.startsWith('Playlist:')) {
        const id = parseInt(activeView.split(':')[1]);
        if (!isNaN(id)) return { type: 'playlist', id };
    }

    if (activeView.startsWith('Album:')) {
        const id = parseInt(activeView.split(':')[1]);
        if (!isNaN(id)) return { type: 'album', id };
    }

    if (activeView.startsWith('Artist:')) {
        const parts = activeView.split(':');
        return { type: 'artist', name: parts[1], id: parts[2] ? parseInt(parts[2]) : undefined };
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
