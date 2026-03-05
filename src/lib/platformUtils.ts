/**
 * Centralized platform detection utilities.
 *
 * All platform-related string matching lives here so the rest of the codebase
 * can just call `detectPlatform(source)` instead of hand-writing includes checks.
 */

export type Platform = 'netease' | 'qq' | 'qishui' | 'local' | 'unknown';

/** Detect which music platform a track source string refers to. */
export function detectPlatform(source: string | undefined): Platform {
    if (!source) return 'unknown';
    const lower = source.toLowerCase();

    if (lower.includes('netease') || lower.includes('网易')) return 'netease';
    if (lower.includes('qq')) return 'qq';
    if (lower.includes('qishui') || lower.includes('汽水')) return 'qishui';
    if (lower.includes('local') || lower.includes('本地')) return 'local';

    return 'unknown';
}

/** Map from platform to i18n key used in PlayerBar / FullScreenPlayer. */
export function getPlatformI18nKey(source: string | undefined): string {
    const platform = detectPlatform(source);
    return platform === 'unknown' ? 'netease' : platform;
}

/**
 * Get the HTTP Referer header required by a platform's CDN for anti-hotlink bypass.
 * Returns undefined if no Referer is needed (e.g. local files).
 */
export function getPlatformReferer(platform: Platform): string | undefined {
    switch (platform) {
        case 'netease': return 'https://music.163.com/';
        case 'qq': return 'https://y.qq.com/';
        case 'qishui': return 'https://music.douyin.com/';
        default: return undefined;
    }
}

/** Check whether a source string refers to a NetEase track. */
export function isNeteasePlatform(source: string | undefined): boolean {
    return detectPlatform(source) === 'netease';
}
