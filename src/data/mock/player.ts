import type { Track } from '../../types';
import { unifiedSongs } from './songs';

// Convert Song to Track for player compatibility
// In a real app we might unify these types or have a proper mapper
const songToTrack = (song: typeof unifiedSongs[0]): Track => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    duration: song.duration,
    currentTime: '0:00',
    source: song.bestSource || 'System',
    quality: song.sources?.[0]?.qualityLabel || 'Standard',
    cover: song.sources?.[0]?.color || undefined // Optional cover/color
});

// ================== DEFAULT TRACK ==================
export const defaultTrack: Track = songToTrack(unifiedSongs[0]); // Use first song as default

// ================== INITIAL QUEUE ==================
export const initialQueue: Track[] = unifiedSongs.slice(0, 5).map(songToTrack);
