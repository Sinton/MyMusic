import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { remoteLog } from '../lib/audioUtils';

/**
 * Hook that owns the raw HTMLAudioElement lifecycle.
 *
 * Responsibilities:
 * - Creates the <audio> element once on mount
 * - Wires up event listeners (loadedmetadata, timeupdate, ended, play, pause, error)
 * - Pushes progress updates into PlayerStore
 * - Calls nextTrack() when the current track ends
 * - Cleans up on unmount
 *
 * Returns a stable ref to the audio element for other hooks to consume.
 */
export function useAudioPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastLoggedTimeRef = useRef(-1);
    const setProgress = usePlayerStore((s) => s.setProgress);
    const nextTrack = usePlayerStore((s) => s.nextTrack);

    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        audio.addEventListener('error', () => {
            const err = audio.error;
            remoteLog(`[AudioPlayer] Audio Error: code=${err?.code} message=${err?.message}`);
        });

        const onLoadedMetadata = () => {
            const d = audio.duration;
            remoteLog(`[AudioPlayer] onLoadedMetadata: duration = ${d}`);
            if (d && isFinite(d)) {
                usePlayerStore.setState({ durationSec: Math.floor(d) });
            }
        };

        const onTimeUpdate = () => {
            const currentTime = Math.floor(audio.currentTime);
            if (currentTime !== lastLoggedTimeRef.current) {
                setProgress(currentTime);
                lastLoggedTimeRef.current = currentTime;
            }
        };

        const onEnded = () => {
            remoteLog('[AudioPlayer] onEnded: next track');
            nextTrack(true);
        };

        const onPlay = () => remoteLog('[AudioPlayer] onPlay event fired');
        const onPause = () => remoteLog('[AudioPlayer] onPause event fired');
        const onError = () => remoteLog(`[AudioPlayer] onError event: ${audio.error?.code} ${audio.error?.message}`);

        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('error', onError);

        remoteLog('[AudioPlayer] Initialized');

        return () => {
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('error', onError);
            audio.pause();
            audio.src = '';
        };
    }, [setProgress, nextTrack]);

    return audioRef;
}
