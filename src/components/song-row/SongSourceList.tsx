import React from 'react';
import { Play } from 'lucide-react';
import { PlatformBadge, QualityBadge, VipBadge } from '../index';
import type { Song, AudioSource } from '../../types';

interface SongSourceListProps {
    song: Song;
    expanded: boolean;
    onPlaySource: (source: AudioSource) => void;
}

export const SongSourceList: React.FC<SongSourceListProps> = ({ song, expanded, onPlaySource }) => {
    return (
        <div
            className={`grid gap-2 px-4 transition-all duration-300 ease-in-out ${expanded ? 'pb-4 opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'
                }`}
        >
            <div className="h-[1px] bg-[var(--glass-border)] mx-1 mb-2"></div>
            {song.sources.map((source, idx) => (
                <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--glass-border)] hover:bg-[var(--glass-highlight)] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <PlatformBadge name={source.platform} color={source.color} size="sm" />
                        <span className="text-sm text-[var(--text-main)]">{source.platform}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <QualityBadge label={source.qualityLabel} />
                        {source.vip && <VipBadge variant="outline" />}
                        <button
                            onClick={() => onPlaySource(source)}
                            className="p-1.5 rounded-full bg-[var(--glass-highlight)] hover:bg-[var(--text-main)] hover:text-[var(--bg-color)] transition-colors"
                        >
                            <Play className="w-3 h-3 fill-current" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
