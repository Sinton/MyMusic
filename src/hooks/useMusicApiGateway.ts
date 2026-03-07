import { invoke } from '@tauri-apps/api/core';
import { useState, useCallback } from 'react';
import { GatewayResponse } from '../types/gateway';

export function useMusicApiGateway() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = useCallback(async (
        provider: string,
        apiName: string,
        params: any = {},
        cookie: string = ''
    ): Promise<GatewayResponse | null> => {
        setLoading(true);
        setError(null);
        try {
            const traceId = `trace-${Date.now()}`;

            // Encode parameters as key=value&key=value string for Rust parse_params
            const paramString = Object.entries(params)
                .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
                .join('&');

            const res = await invoke<GatewayResponse>('request_api_gateway', {
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
