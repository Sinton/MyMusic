import { invoke } from '@tauri-apps/api/core';
import { useState, useCallback } from 'react';
import { UnifiedResponse } from '../../types/unified';

export function useMusicApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = useCallback(async (
        provider: string,
        apiName: string,
        params: any = {},
        cookie: string = ''
    ): Promise<UnifiedResponse | null> => {
        setLoading(true);
        setError(null);
        try {
            const traceId = `trace-${Date.now()}`;
            
            // Encode parameters as key=value&key=value string for Rust parse_params
            const paramString = Object.entries(params)
                .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
                .join('&');

            const res = await invoke<UnifiedResponse>('request_api_unified', {
                provider,
                apiName,
                params: paramString,
                cookie,
                traceId,
            });
            return res;
        } catch (err: any) {
            console.error(`[MusicApi] ${provider}/${apiName} failed:`, err);
            setError(err.toString());
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        request,
        loading,
        error,
    };
}
