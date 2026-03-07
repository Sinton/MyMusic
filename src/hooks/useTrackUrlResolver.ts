import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { NeteaseService } from '../services/NeteaseService';
import { detectPlatform, getPlatformReferer } from '../lib/platformUtils';
import { QQService } from '../services/QQService';
import { useQQStore } from '../stores/useQQStore';
import { remoteLog, parseDuration } from '../lib/audioUtils';

/**
 * Hook that resolves the playback URL for the current track
 * and loads it into the provided audio element.
 *
 * Responsibilities:
 * - Detects the platform of the current track
 * - Fetches the playback URL from the appropriate service (NetEase v1 → legacy fallback)
 * - Downloads the audio stream via the local Axum proxy (for referer bypass)
 * - Sets the resolved URL to the <audio> element
 * - Manages cleanup and cancellation
 */
export function useTrackUrlResolver(audioRef: React.RefObject<HTMLAudioElement | null>) {
    const currentTrack = usePlayerStore((s) => s.currentTrack);
    const setDuration = usePlayerStore((s) => s.setDuration);
    const neteaseCookie = useNeteaseStore((s) => s.cookie);
    const qqCookie = useQQStore((s) => s.cookie);
    const currentUrlRef = useRef<string>('');

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const platform = detectPlatform(currentTrack.source);
        remoteLog(`[UrlResolver] Track Source: ${currentTrack.source} Platform: ${platform}`);

        // Immediately stop old track and clear its playback URI
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        currentUrlRef.current = '';

        if (platform !== 'netease' && platform !== 'qq' && platform !== 'qishui') {
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                let url: string | null = null;
                let durationFromApi = 0;

                // Step 1: Resolve playback URL based on platform
                if (platform === 'netease') {
                    const data = await NeteaseService.getSongUrl(currentTrack.songId, neteaseCookie);
                    const urlData = data?.data?.[0];
                    url = urlData?.url ?? null;
                    durationFromApi = urlData?.time ? Math.floor(urlData.time / 1000) : 0;

                    if (!url) {
                        remoteLog('[UrlResolver] v1 URL is null, trying legacy song_url...');
                        const legacyResult = await invoke('request_api', {
                            provider: 'netease',
                            apiName: 'song_url',
                            params: `id=${currentTrack.songId}&br=128000`,
                            cookie: neteaseCookie,
                        }) as { body: { data?: Array<{ url?: string }> } };
                        const legacyData = legacyResult.body?.data?.[0];
                        url = legacyData?.url ?? null;
                    }
                } else if (platform === 'qq') {
                    const songmid = String(currentTrack.songMid || currentTrack.songId);
                    remoteLog(`[UrlResolver] QQ Music: Resolving URL for songmid=${songmid}`);
                    try {
                        const urls = await QQService.getSongUrl(songmid, qqCookie);
                        if (urls.length > 0) {
                            url = urls[0];
                        }
                    } catch (qqErr: any) {
                        remoteLog(`[UrlResolver] QQ Music error: ${qqErr?.message || qqErr}`);
                    }
                } else if (platform === 'qishui') {
                    const directUrl = String(currentTrack.songMid || '');
                    if (directUrl && directUrl.startsWith('http')) {
                        url = directUrl;
                        durationFromApi = parseDuration(currentTrack.duration);
                    }
                }

                if (cancelled) return;

                if (url) {
                    const referer = getPlatformReferer(platform);
                    try {
                        const proxyPort = await invoke<number>('get_proxy_port');
                        const proxiedUrl = `http://127.0.0.1:${proxyPort}/proxy?url=${encodeURIComponent(url)}` +
                            (referer ? `&referer=${encodeURIComponent(referer)}` : '');
                        url = proxiedUrl;
                        remoteLog(`[UrlResolver] Proxied URL initialized`);
                    } catch (proxyErr) {
                        remoteLog(`[UrlResolver] Proxy port error: ${proxyErr}, using direct URL`);
                    }

                    currentUrlRef.current = url;
                    audio.src = url;

                    if (durationFromApi > 0) {
                        setDuration(durationFromApi);
                    }

                    if (usePlayerStore.getState().isPlaying) {
                        audio.play().catch(e => {
                            remoteLog(`[UrlResolver] Playback Error: ${e.message}`);
                        });
                    }
                } else {
                    remoteLog(`[UrlResolver] ERROR: No URL found for ${platform}`);
                }
            } catch (err: any) {
                remoteLog(`[UrlResolver] Critical Error: ${err.message || err}`);
            }
        })();

        return () => { cancelled = true; };
    }, [currentTrack?.songId, currentTrack?.songMid, currentTrack?.source, neteaseCookie, qqCookie, audioRef, setDuration]);

    return { currentUrlRef };
}
