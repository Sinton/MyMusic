import { useEffect } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';

/**
 * Hook that syncs the PlayerStore state → HTMLAudioElement.
 *
 * Responsibilities:
 * - Play/Pause synchronization
 * - Volume synchronization
 * - Seek (scrub bar) synchronization
 */
export function useAudioSync(
    audioRef: React.RefObject<HTMLAudioElement | null>,
    currentUrlRef: React.RefObject<string>
) {
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const volume = usePlayerStore((s) => s.volume);
    const currentTimeSec = usePlayerStore((s) => s.currentTimeSec);

    // Sync Seek Operations
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentUrlRef.current) return;

        // If the difference between audio time and store time is large (user clicked scrub bar)
        if (Math.abs(audio.currentTime - currentTimeSec) > 2) {
            audio.currentTime = currentTimeSec;
        }
    }, [currentTimeSec, audioRef, currentUrlRef]);

    // Sync Play/Pause state from Store
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentUrlRef.current) return;

        if (isPlaying && (audio.paused || audio.ended)) {
            audio.play().catch(e => console.error('Play failed:', e));
        } else if (!isPlaying && !audio.paused) {
            audio.pause();
        }
    }, [isPlaying, audioRef, currentUrlRef, currentTimeSec]);

    // Sync Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
        }
    }, [volume, audioRef]);
}
