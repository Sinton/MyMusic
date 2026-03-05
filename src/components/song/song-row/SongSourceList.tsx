import React from 'react';
import { Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '../../../stores/usePlayerStore'; // Store import
import { getPlatformI18nKey } from '../../../lib/platformUtils';
import { PlatformBadge, QualityBadge, VipBadge } from '../../common';
import type { Song, AudioSource } from '../../../types';

interface SongSourceListProps {
    song: Song;
    expanded: boolean;
    onPlaySource: (source: AudioSource) => void;
}



export const SongSourceList: React.FC<SongSourceListProps> = ({ song, expanded, onPlaySource }) => {
    const { t } = useTranslation();
    const { currentTrack, isPlaying, togglePlay } = usePlayerStore(); // Hook usage

    // Check if a specific source is currently playing
    const isSourceActive = (source: AudioSource) => {
        if (!currentTrack || currentTrack.id !== song.id) return false;
        // Logic similar to SongRow indicator
        const p1 = source.platform.toLowerCase();
        const p2 = currentTrack.source.toLowerCase();
        const platformMatch = p1.includes(p2) || p2.includes(p1);
        const q1 = source.qualityLabel.toLowerCase();
        const q2 = currentTrack.quality.toLowerCase();
        const qualityMatch = !currentTrack.quality || q1 === q2 || (q1 === 'standard' && q2 === 'standard');

        return platformMatch && qualityMatch;
    };

    const handleRowClick = (source: AudioSource, e: React.MouseEvent) => {
        // Stop bubbling if button inside is clicked (though button logic will handle it too)
        // Actually, we want whole row to behave like button unless button has specific logic
        // But here let's just make the whole row the trigger.
        e.stopPropagation();

        if (isSourceActive(source)) {
            togglePlay();
        } else {
            onPlaySource(source);
        }
    };

    return (
        <div
            className={`grid gap-2 px-4 transition-all duration-300 ease-in-out ${expanded ? 'pb-4 opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'
                }`}
        >
            <div className="h-[1px] bg-[var(--glass-border)] mx-1 mb-2"></div>
            {song.sources.map((source, idx) => {
                const isActive = isSourceActive(source);
                const showPause = isActive && isPlaying;

                return (
                    <div
                        key={idx}
                        onClick={(e) => handleRowClick(source, e)}
                        className={`flex items-center justify-between p-2 h-[44px] rounded-lg transition-all cursor-pointer group/item border border-transparent ${isActive
                            ? ''
                            : 'bg-[var(--glass-border)] hover:bg-[var(--glass-highlight)]'
                            }`}
                        style={{
                            backgroundColor: isActive ? 'var(--accent-color)' : undefined, // We will apply opacity via a mask or just assume we can't easily alpha-blend a variable without color-mix.
                            // Let's try CSS color-mix if modern browser, or just a fallback. 
                            // Actually, let's just use the 'bg-accent/20' logic but if it fails, maybe the variable isn't defined as a color in tailwind.
                            // Simple fix: use a style with opacity? No, that affects content.
                            // Best fix: Use a pseudo-background div or a hardcoded semi-transparent approximation if need be.
                            // BUT, SongRow works. Why? Because SongRow probably uses a variable that simply resolves.
                            // Let's rely on `color-mix` which is widely supported now.
                            background: isActive ? 'color-mix(in srgb, var(--accent-color), transparent 80%)' : undefined
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <PlatformBadge name={source.platform} color={source.color} size="sm" />
                            <span className={`text-sm ${isActive ? 'text-[var(--accent-color)] font-medium' : 'text-[var(--text-main)]'}`}>{t(`platforms.${getPlatformI18nKey(source.platform)}`)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <QualityBadge label={source.qualityLabel} />
                            {source.vip && <VipBadge variant="outline" platform={source.platform} />}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // prevent double trigger
                                    handleRowClick(source, e);
                                }}
                                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isActive
                                    ? 'bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]/80'
                                    : 'bg-[var(--glass-highlight)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)]'
                                    }`}
                            >
                                {showPause ? (
                                    <Pause className="w-3 h-3 fill-current" />
                                ) : (
                                    <Play className="w-3 h-3 fill-current ml-0.5" />
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
