import { useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { NeteaseService } from '../services/NeteaseService';

export function AudioEngine() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentUrlRef = useRef<string>('');
    const isNetease = useRef(false);
    const isSeeking = useRef(false);
    const lastLoggedTimeRef = useRef(-1);
    const blobUrlRef = useRef<string | null>(null);
    const setProgress = usePlayerStore((s) => s.setProgress);
    const nextTrack = usePlayerStore((s) => s.nextTrack);

    const remoteLog = (msg: string) => {
        invoke('log_info', { message: msg }).catch((e) => { console.error('Remote log fail', e) });
        console.log(msg);
    };

    useEffect(() => {
        remoteLog('[AudioEngine] Initialized');
    }, []);

    // Helper to parse "mm:ss" to seconds
    const parseDuration = useCallback((dur: string) => {
        if (!dur) return 0;
        const parts = dur.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return 0;
    }, []);

    const currentTrack = usePlayerStore((s) => s.currentTrack);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    // ... rest of the component state ...
    const volume = usePlayerStore((s) => s.volume);
    const currentTimeSec = usePlayerStore((s) => s.currentTimeSec);
    const cookie = useNeteaseStore((s) => s.cookie);

    // 1. Initialize Audio Element
    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        audio.addEventListener('error', () => {
            const err = audio.error;
            remoteLog(`[AudioEngine] Audio Error: code=${err?.code} message=${err?.message}`);
        });

        const onLoadedMetadata = () => {
            const d = audio.duration;
            remoteLog(`[AudioEngine] onLoadedMetadata: duration = ${d}`);
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
            remoteLog('[AudioEngine] onEnded: next track');
            nextTrack();
        };

        const onPlay = () => remoteLog('[AudioEngine] onPlay event fired');
        const onPause = () => remoteLog('[AudioEngine] onPause event fired');
        const onError = () => remoteLog(`[AudioEngine] onError event: ${audio.error?.code} ${audio.error?.message}`);

        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('error', onError);

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

    // 2. Fetch and Load URL when track changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const source = currentTrack.source?.toLowerCase() || '';
        const trackIsNetease = source.includes('netease') || source.includes('网易');
        remoteLog(`[AudioEngine] Track Source: ${source} Is Netease: ${trackIsNetease}`);
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
                let data: any = await NeteaseService.getSongUrl(currentTrack.id, cookie);
                console.log('[AudioEngine] Got song url data:', data);
                let urlData = data?.data?.[0] || {};
                let url = urlData.url;

                // Fallback to legacy URL API if v1 returns null
                if (!url) {
                    remoteLog('[AudioEngine] v1 URL is null, trying legacy song_url...');
                    const legacyResult = await invoke('request_api', {
                        provider: 'netease',
                        apiName: 'song_url',
                        params: `id=${currentTrack.id}&br=128000`,
                        cookie,
                    }) as any;
                    remoteLog(`[AudioEngine] legacyResult: ${JSON.stringify(legacyResult.body)}`);
                    const legacyData = legacyResult.body?.data?.[0] || {};
                    url = legacyData.url;
                }

                const durationFromTrack = parseDuration(currentTrack.duration);
                remoteLog(`[AudioEngine] Final track URL: ${url} Fallback Duration: ${durationFromTrack}`);

                if (cancelled) return;

                if (!url) {
                    remoteLog('[AudioEngine] No URL returned from Netease APIs.');
                    return;
                }

                try {
                    remoteLog(`[AudioEngine] Downloading bytes via bridge...`);
                    // Ensure we pass the appropriate header so NetEase CDN does not reject with 403
                    const referer = 'https://music.163.com/';
                    const bytesArray = await invoke('request_bytes', { url, referer }) as number[];
                    const uint8 = new Uint8Array(bytesArray);
                    const blob = new Blob([uint8], { type: 'audio/mpeg' });
                    const blobUrl = URL.createObjectURL(blob);

                    if (blobUrlRef.current) {
                        URL.revokeObjectURL(blobUrlRef.current);
                    }
                    blobUrlRef.current = blobUrl;

                    const autoPlay = usePlayerStore.getState().isPlaying;
                    remoteLog(`[AudioEngine] Loading Blob URL. isPlaying: ${autoPlay}`);

                    currentUrlRef.current = blobUrl;
                    audio.src = blobUrl;
                    audio.load();

                    if (autoPlay) {
                        audio.play().catch(e => remoteLog(`[AudioEngine] Blob play failed: ${e}`));
                    }
                } catch (err) {
                    remoteLog(`[AudioEngine] Byte bridge failed: ${err}. Falling back to direct URL.`);
                    const autoPlay = usePlayerStore.getState().isPlaying;
                    audio.src = url;
                    audio.load();
                    if (autoPlay) {
                        audio.play().catch(e => remoteLog(`[AudioEngine] Fallback play failed: ${e}`));
                    }
                }

                // Set duration from API if valid, otherwise use fallback
                const durationFromApi = urlData.time ? Math.floor(urlData.time / 1000) : 0;
                const finalDuration = durationFromApi > 0 ? durationFromApi : durationFromTrack;

                if (finalDuration > 0) {
                    usePlayerStore.setState({ durationSec: finalDuration });
                }

                if (usePlayerStore.getState().isPlaying) {
                    remoteLog('[AudioEngine] Triggering audio.play()');
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => remoteLog(`[AudioEngine] Play failed: ${e}`));
                    }
                }
            } catch (err) {
                remoteLog(`[AudioEngine] Failed to fetch song URL: ${err}`);
            }
        })();

        return () => { cancelled = true; };
    }, [currentTrack.id, currentTrack.source, cookie, parseDuration]);

    // 3. Sync Play/Pause state from Store
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !isNetease.current || !currentUrlRef.current) return;

        if (isPlaying && audio.paused) {
            audio.play().catch(e => console.error('Play failed:', e));
        } else if (!isPlaying && !audio.paused) {
            audio.pause();
        }
    }, [isPlaying]);

    // 4. Sync Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
        }
    }, [volume]);

    // 5. Sync Seek Operations
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !isNetease.current || !currentUrlRef.current) return;

        // If the difference between audio time and store time is huge (user clicked scrub bar)
        // Set audio.currentTime.
        if (Math.abs(audio.currentTime - currentTimeSec) > 2) {
            isSeeking.current = true;
            audio.currentTime = currentTimeSec;
            // Short timeout to prevent the immediate next timeupdate from causing a glitch
            setTimeout(() => { isSeeking.current = false; }, 300);
        }
    }, [currentTimeSec]);

    return null;
}

