/**
 * Shared types and constants for AuthModal sub-components.
 */

export type AuthStep = 'qrcode' | 'scanning' | 'success' | 'expired' | 'error' | 'phone' | 'cookie' | 'verify';
export type LoginMode = 'qr' | 'phone' | 'cookie';

export const PLATFORM_COLORS: Record<string, string> = {
    'NetEase Cloud': '#e60026',
    'QQ Music': '#31c27c',
    'Soda Music': '#ffde00',
};

export interface LoginFormProps {
    accentColor: string;
    phoneError: string;
    loading: boolean;
}
