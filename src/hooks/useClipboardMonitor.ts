import { useEffect, useRef, useCallback } from 'react';
import { QishuiService } from '../services/QishuiService';
import { useSettingsStore } from '../stores/useSettingsStore';

export interface ClipboardTrackInfo {
    trackId: string;
    originalUrl: string;
}

/**
 * Monitors the clipboard for Qishui Music share links.
 * Triggers `onDetect` callback when a new link is found (on window focus).
 */
export function useClipboardMonitor(
    onDetect: (info: ClipboardTrackInfo) => void
) {
    const lastProcessedUrl = useRef<string>('');
    const clipboardEnabled = useSettingsStore(s => s.clipboardMonitor);

    const checkClipboard = useCallback(async () => {
        if (!clipboardEnabled) return;

        try {
            const text = await navigator.clipboard.readText();
            if (!text || text === lastProcessedUrl.current) return;

            const trimmed = text.trim();

            // Quick client-side check first (no network)
            if (!QishuiService.isQishuiLink(trimmed)) return;

            // Mark as processed to avoid re-triggering
            lastProcessedUrl.current = text;

            console.log('[ClipboardMonitor] Detected Qishui link:', trimmed);

            // Validate on backend (resolves short links, extracts track_id)
            // Backend handles extracting the URL from mixed text (e.g. song title + URL)
            const result = await QishuiService.validateLink(trimmed);

            if (result.data?.isQishuiLink && result.data?.trackId) {
                onDetect({
                    trackId: result.data.trackId,
                    originalUrl: result.data.originalUrl || trimmed,
                });
            }
        } catch (err) {
            // Clipboard API may fail if not focused or denied — silently ignore
        }
    }, [clipboardEnabled, onDetect]);

    useEffect(() => {
        if (!clipboardEnabled) return;

        // Check on window focus
        const handleFocus = () => {
            // Small delay to ensure clipboard is ready
            setTimeout(checkClipboard, 300);
        };

        window.addEventListener('focus', handleFocus);

        // Also check immediately on mount (app just opened)
        setTimeout(checkClipboard, 1000);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [clipboardEnabled, checkClipboard]);
}
