import { invoke } from '@tauri-apps/api/core';

/**
 * Lightweight remote logger that sends messages to both:
 * - Rust backend's `log_info` command (appends to debug.log)
 * - Browser console
 */
export function remoteLog(msg: string): void {
    invoke('log_info', { message: msg }).catch((e) => {
        console.error('Remote log fail', e);
    });
    console.log(msg);
}

/**
 * Parse a "mm:ss" duration string into total seconds.
 * Returns 0 for invalid or empty input.
 */
export function parseDuration(dur: string): number {
    if (!dur) return 0;
    const parts = dur.split(':');
    if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
}
