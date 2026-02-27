import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { NeteaseService } from '../services/NeteaseService';
import { detectPlatform, getPlatformReferer } from '../lib/platformUtils';
import { QQMusicService } from '../services/QQMusicService';
import { useQQStore } from '../stores/useQQStore';
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
    const neteaseCookie = useNeteaseStore((s) => s.cookie);
    const qqCookie = useQQStore((s) => s.cookie);
    const currentUrlRef = useRef<string>('');
    const blobUrlRef = useRef<string | null>(null);
    const isNetease = useRef(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const platform = detectPlatform(currentTrack.source);
        isNetease.current = platform === 'netease';
        remoteLog(`[UrlResolver] Track Source: ${currentTrack.source} Platform: ${platform}`);

        // Immediately stop old track and clear its playback URI
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        currentUrlRef.current = '';
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }

        if (platform !== 'netease' && platform !== 'qq') {
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                let url: string | null = null;
                let durationFromApi = 0;

                // Step 1: Resolve playback URL based on platform
                if (platform === 'netease') {
                    const data = await NeteaseService.getSongUrl(currentTrack.id, neteaseCookie);
                    const urlData = data?.data?.[0];
                    url = urlData?.url ?? null;
                    durationFromApi = urlData?.time ? Math.floor(urlData.time / 1000) : 0;

                    // Fallback to legacy URL API if v1 returns null
                    if (!url) {
                        remoteLog('[UrlResolver] v1 URL is null, trying legacy song_url...');
                        const legacyResult = await invoke('request_api', {
                            provider: 'netease',
                            apiName: 'song_url',
                            params: `id=${currentTrack.id}&br=128000`,
                            cookie: neteaseCookie,
                        }) as { body: { data?: Array<{ url?: string }> } };
                        const legacyData = legacyResult.body?.data?.[0];
                        url = legacyData?.url ?? null;
                    }
                } else if (platform === 'qq') {
                    const songmid = String(currentTrack.sourceId || currentTrack.id);
                    remoteLog(`[UrlResolver] QQ Music: Resolving URL for songmid=${songmid}, cookie=${qqCookie ? 'present' : 'empty'}`);
                    try {
                        // Call getSongUrl and log everything
                        const urls = await QQMusicService.getSongUrl(songmid, qqCookie);
                        remoteLog(`[UrlResolver] QQ Music: Got ${urls.length} URLs: ${JSON.stringify(urls).substring(0, 300)}`);
                        if (urls.length > 0) {
                            url = urls[0];
                        }
                    } catch (qqErr: any) {
                        remoteLog(`[UrlResolver] QQ Music getSongUrl error: ${qqErr?.message || qqErr}`);
                    }
                }

                const durationFromTrack = parseDuration(currentTrack.duration);
                remoteLog(`[UrlResolver] Final track URL: ${url} Fallback Duration: ${durationFromTrack}`);

                if (cancelled) return;

                if (!url) {
                    remoteLog(`[UrlResolver] No URL returned from ${platform} APIs.`);
                    // Still set duration even if URL fails
                    if (durationFromTrack > 0) {
                        usePlayerStore.setState({ durationSec: durationFromTrack });
                    }
                    return;
                }

                // Step 2: Download via Rust byte bridge (if needed)
                try {
                    const platform = detectPlatform(currentTrack.source);

                    remoteLog(`[UrlResolver] Downloading bytes via bridge...`);
                    const referer = getPlatformReferer(platform);
                    const bytesArray = await invoke('request_bytes', { url, referer }) as number[];

                    if (!bytesArray || bytesArray.length < 1000) {
                        throw new Error(`Downloaded bytes too small (${bytesArray?.length}), likely an error page`);
                    }

                    const uint8 = new Uint8Array(bytesArray);

                    let mimeType = 'audio/mpeg'; // default mp3
                    if (url.includes('.m4a') || url.includes('.m4a?')) mimeType = 'audio/mp4';
                    else if (url.includes('.flac') || url.includes('.flac?')) mimeType = 'audio/flac';

                    const blob = new Blob([uint8], { type: mimeType });
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
    }, [currentTrack.id, currentTrack.source, currentTrack.sourceId, neteaseCookie, qqCookie, audioRef]);

    return { currentUrlRef, isNetease };
}
