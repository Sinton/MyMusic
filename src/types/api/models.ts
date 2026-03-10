export type MusicAuthStatus =
    | 'waiting'
    | 'scanned'
    | 'success'
    | 'expired'
    | 'canceled'
    | { error: string };

export interface MusicAuthResponse {
    platform: string;
    action: string;
    authId: string;
    qrData?: string;
    status: MusicAuthStatus | string; // Compatibility with both enum-like string and legacy
    nickname?: string;
    avatar?: string;
    cookie?: string;
    auth_origin_url?: string;
}
