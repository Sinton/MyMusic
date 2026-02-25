import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { NeteaseService } from '../services/NeteaseService';
import { isNeteasePlatform, detectPlatform, getPlatformReferer } from '../lib/platformUtils';
import { remoteLog, parseDuration } from '../lib/audioUtils';

/**
 * Hook that resolves the playback URL for the current track
 * and loads it into the provided audio element.
 *
 * Responsibilities:
 * - Detects the platform of the current track
 * - Fetches the playback URL from the appropriate service (NetEase v1 → legacy fallback)
 * - Downloads the audio stream via the Rust byte bridge (with anti-hotlink referer)
 * - Creates a Blob URL and loads it into the <audio> element
 * - Falls back to direct URL loading if the byte bridge fails
 * - Manages Blob URL lifecycle (revokeObjectURL on changes)
 * - Sets the duration from API response
 */
export function useTrackUrlResolver(audioRef: React.RefObject<HTMLAudioElement | null>) {
    const currentTrack = usePlayerStore((s) => s.currentTrack);
    const cookie = useNeteaseStore((s) => s.cookie);
    const currentUrlRef = useRef<string>('');
    const blobUrlRef = useRef<string | null>(null);
    const isNetease = useRef(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const trackIsNetease = isNeteasePlatform(currentTrack.source);
        remoteLog(`[UrlResolver] Track Source: ${currentTrack.source} Is Netease: ${trackIsNetease}`);
        isNetease.current = trackIsNetease;

        if (!trackIsNetease) {
            audio.pause();
            audio.src = '';
            currentUrlRef.current = '';
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                // Step 1: Resolve playback URL
                const data = await NeteaseService.getSongUrl(currentTrack.id, cookie);
                console.log('[UrlResolver] Got song url data:', data);
                const urlData = data?.data?.[0];
                let url = urlData?.url ?? null;

                // Fallback to legacy URL API if v1 returns null
                if (!url) {
                    remoteLog('[UrlResolver] v1 URL is null, trying legacy song_url...');
                    const legacyResult = await invoke('request_api', {
                        provider: 'netease',
                        apiName: 'song_url',
                        params: `id=${currentTrack.id}&br=128000`,
                        cookie,
                    }) as { body: { data?: Array<{ url?: string }> } };
                    remoteLog(`[UrlResolver] legacyResult: ${JSON.stringify(legacyResult.body)}`);
                    const legacyData = legacyResult.body?.data?.[0];
                    url = legacyData?.url ?? null;
                }

                const durationFromTrack = parseDuration(currentTrack.duration);
                remoteLog(`[UrlResolver] Final track URL: ${url} Fallback Duration: ${durationFromTrack}`);

                if (cancelled) return;

                if (!url) {
                    remoteLog('[UrlResolver] No URL returned from Netease APIs.');
                    return;
                }

                // Step 2: Download via Rust byte bridge
                try {
                    remoteLog(`[UrlResolver] Downloading bytes via bridge...`);
                    const platform = detectPlatform(currentTrack.source);
                    const referer = getPlatformReferer(platform);
                    const bytesArray = await invoke('request_bytes', { url, referer }) as number[];
                    const uint8 = new Uint8Array(bytesArray);
                    const blob = new Blob([uint8], { type: 'audio/mpeg' });
                    const blobUrl = URL.createObjectURL(blob);

                    // Clean up previous Blob URL
                    if (blobUrlRef.current) {
                        URL.revokeObjectURL(blobUrlRef.current);
                    }
                    blobUrlRef.current = blobUrl;

                    const autoPlay = usePlayerStore.getState().isPlaying;
                    remoteLog(`[UrlResolver] Loading Blob URL. isPlaying: ${autoPlay}`);

                    currentUrlRef.current = blobUrl;
                    audio.src = blobUrl;
                    audio.load();

                    if (autoPlay) {
                        audio.play().catch(e => remoteLog(`[UrlResolver] Blob play failed: ${e}`));
                    }
                } catch (err) {
                    // Step 3: Fallback to direct URL if byte bridge fails
                    remoteLog(`[UrlResolver] Byte bridge failed: ${err}. Falling back to direct URL.`);
                    const autoPlay = usePlayerStore.getState().isPlaying;
                    currentUrlRef.current = url;
                    audio.src = url;
                    audio.load();
                    if (autoPlay) {
                        audio.play().catch(e => remoteLog(`[UrlResolver] Fallback play failed: ${e}`));
                    }
                }

                // Step 4: Set duration
                const durationFromApi = urlData?.time ? Math.floor(urlData.time / 1000) : 0;
                const finalDuration = durationFromApi > 0 ? durationFromApi : durationFromTrack;

                if (finalDuration > 0) {
                    usePlayerStore.setState({ durationSec: finalDuration });
                }

                if (usePlayerStore.getState().isPlaying) {
                    remoteLog('[UrlResolver] Triggering audio.play()');
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => remoteLog(`[UrlResolver] Play failed: ${e}`));
                    }
                }
            } catch (err) {
                remoteLog(`[UrlResolver] Failed to fetch song URL: ${err}`);
            }
        })();

        return () => { cancelled = true; };
    }, [currentTrack.id, currentTrack.source, cookie, audioRef]);

    return { currentUrlRef, isNetease };
}
