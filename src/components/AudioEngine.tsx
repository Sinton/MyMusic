import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useTrackUrlResolver } from '../hooks/useTrackUrlResolver';
import { useAudioSync } from '../hooks/useAudioSync';

/**
 * AudioEngine — thin orchestrator component.
 *
 * Composes three specialized hooks:
 * 1. useAudioPlayer     — owns the HTMLAudioElement lifecycle
 * 2. useTrackUrlResolver — resolves playback URLs and loads audio data
 * 3. useAudioSync        — syncs PlayerStore state ↔ audio element
 *
 * Renders nothing (returns null).
 */
export function AudioEngine() {
    const audioRef = useAudioPlayer();
    const { currentUrlRef } = useTrackUrlResolver(audioRef);
    useAudioSync(audioRef, currentUrlRef);

    return null;
}
