import { invoke } from '@tauri-apps/api/core';
import type { MusicAuthResponse } from '../types/api/models';

export const AuthService = {
    /**
     * Unified authentication gateway call
     */
    async requestAuth(provider: string, apiName: string, params: string = '', cookie: string = ''): Promise<MusicAuthResponse> {
        const traceId = Math.random().toString(36).substring(2, 8).toUpperCase();
        try {
            console.log(`[AuthService][${traceId}] Requesting Auth API: ${apiName} for ${provider}`, params);
            const response = await invoke('request_api_gateway', {
                provider,
                apiName,
                params,
                cookie,
                traceId
            });

            // The result is a GatewayResponse. In Rust it's { type: "Auth", data: { ... } }
            const gatewayResp = response as { type: string; data: MusicAuthResponse };
            if (gatewayResp.type === 'Auth') {
                return gatewayResp.data;
            } else {
                throw new Error(`Unexpected gateway response type: ${gatewayResp.type}`);
            }
        } catch (e) {
            console.error('[AuthService] auth error:', e);
            throw e;
        }
    },

    /** Standard QR Init */
    async initQr(provider: string): Promise<MusicAuthResponse> {
        return this.requestAuth(provider, 'auth_qr_init');
    },

    /** Standard QR Check */
    async checkQr(provider: string, authId: string): Promise<MusicAuthResponse> {
        return this.requestAuth(provider, 'auth_qr_check', `auth_id=${authId}`);
    }
};
