/**
 * Parse LRC format lyrics into a sorted array of { time, text } objects.
 * Consolidates the duplicated parseLrc logic from useNeteaseLyric, useQQLyric, and useQishuiLyric.
 */
export function parseLrc(lrc: string): { time: number; text: string }[] {
    if (!lrc) return [];
    const lines = lrc.split('\n');
    const result: { time: number; text: string }[] = [];

    for (const line of lines) {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const ms = parseInt(match[3], 10);
            const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100);
            const text = match[4].trim();
            if (text) {
                result.push({ time, text });
            }
        }
    }

    return result.sort((a, b) => a.time - b.time);
}
