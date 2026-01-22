import React, { useRef, useEffect } from 'react';
import type { LyricLine } from '../../types';
import { findActiveLyricIndex } from '../../lib/playerUtils';

interface LyricsPanelProps {
    lyrics: LyricLine[];
    currentTimeSec: number;
    onSeek: (time: number) => void;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({
    lyrics,
    currentTimeSec,
    onSeek
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeLyricIndex = findActiveLyricIndex(lyrics, currentTimeSec);

    // Auto-scroll lyrics
    useEffect(() => {
        if (containerRef.current && activeLyricIndex !== -1) {
            const container = containerRef.current;
            const activeLine = container.children[activeLyricIndex] as HTMLElement;
            if (activeLine) {
                const containerHeight = container.offsetHeight;
                const offsetTop = activeLine.offsetTop;
                const lineHeight = activeLine.offsetHeight;
                container.scrollTo({
                    top: offsetTop - containerHeight / 2 + lineHeight / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [activeLyricIndex]);

    return (
        <div
            ref={containerRef}
            className="space-y-8 text-3xl font-bold text-[var(--text-secondary)] h-[40vh] overflow-y-auto custom-scrollbar-none mask-image-lyrics relative py-[20vh]"
            style={{ scrollSnapType: 'y proximity' }}
        >
            {lyrics.map((lyric, index) => {
                const isActive = index === activeLyricIndex;
                const isPast = index < activeLyricIndex;
                return (
                    <p
                        key={index}
                        onClick={() => onSeek(lyric.time)}
                        className={`cursor-pointer transition-all duration-500 origin-left ${isActive ? 'text-[var(--text-main)] scale-110 opacity-100 blur-0' : 'opacity-20 blur-[2px] hover:opacity-50'} ${isPast && !isActive ? 'scale-95' : ''}`}
                        style={{ scrollSnapAlign: 'center' }}
                    >
                        {lyric.text}
                    </p>
                );
            })}
        </div>
    );
};

export default LyricsPanel;
