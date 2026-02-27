export type AppRoute =
    | { type: 'home' }
    | { type: 'explore' }
    | { type: 'library', tab: 'Songs' | 'Playlists' | 'Albums' }
    | { type: 'settings' }
    | { type: 'playlist', id: number }
    | { type: 'album', id: number }
    | { type: 'artist', name: string };

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
        return { type: 'artist', name: activeView.split(':')[1] };
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
