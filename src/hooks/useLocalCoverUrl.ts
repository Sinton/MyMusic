import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

let cachedProxyPort: number | null = null;
let fetchingPromise: Promise<number> | null = null;

async function getProxyPort(): Promise<number> {
    if (cachedProxyPort !== null) return cachedProxyPort;
    if (fetchingPromise) return fetchingPromise;

    fetchingPromise = invoke<number>('get_proxy_port').then(port => {
        cachedProxyPort = port;
        return port;
    });

    return fetchingPromise;
}

export function useLocalCoverUrl(cover: string | null | undefined, path: string | undefined): string | null {
    const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!cover) {
            setResolvedUrl(null);
            return;
        }

        // It's a regular url or base64
        if (cover !== 'local_cover') {
            setResolvedUrl(cover);
            return;
        }

        // Needs proxy resolution
        if (!path) {
            setResolvedUrl(null);
            return;
        }

        let isCancelled = false;

        getProxyPort().then(port => {
            if (!isCancelled) {
                setResolvedUrl(`http://127.0.0.1:${port}/cover?path=${encodeURIComponent(path)}`);
            }
        }).catch(err => {
            console.error('[useLocalCoverUrl] Failed to fetch proxy port:', err);
        });

        return () => {
            isCancelled = true;
        };
    }, [cover, path]);

    return resolvedUrl;
}
