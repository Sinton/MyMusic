import React, { useEffect, useRef, useState } from 'react';
import { X, ListMusic, Play, Trash2, Target, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Track } from '../../types';
import { getTrackGradient } from '../../lib/playerUtils';

interface QueuePanelProps {
    isOpen: boolean;
    onClose: () => void;
    queue: Track[];
    currentTrack: Track;
    isPlaying: boolean;
    onPlayTrack: (track: Track) => void;
    onRemoveTrack?: (index: number) => void;
    onClearQueue?: () => void;
}

const QueuePanel: React.FC<QueuePanelProps> = ({
    isOpen,
    onClose,
    queue,
    currentTrack,
    isPlaying,
    onPlayTrack,
    onRemoveTrack,
    onClearQueue
}) => {
    const { t } = useTranslation();
    const [showShadow, setShowShadow] = useState(false);
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToCurrent = () => {
        if (scrollContainerRef.current) {
            const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            setShowShadow(true);
            setTimeout(scrollToCurrent, 300);
        } else {
            const timer = setTimeout(() => {
                setShowShadow(false);
                setShowConfirmClear(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClearClick = () => {
        if (showConfirmClear) {
            onClearQueue?.();
            setShowConfirmClear(false);
        } else {
            setShowConfirmClear(true);
        }
    };

    return (
        <div className={`absolute inset-y-0 right-0 w-full lg:w-[450px] glass-drawer border-l border-[var(--glass-border)] z-[100] transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${showShadow ? 'shadow-[-20px_0_50px_rgba(0,0,0,0.3)]' : ''}`}>
            <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <ListMusic className="w-6 h-6 text-[var(--accent-color)]" />
                            <h3 className="text-xl font-bold text-[var(--text-main)]">{t('fullPlayer.queue.nextUp')}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {queue.length > 0 && (
                                <button
                                    onClick={scrollToCurrent}
                                    className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:bg-[var(--glass-highlight)] rounded-lg transition-all border border-transparent"
                                    title={t('fullPlayer.queue.scrollToActive', '定位当前播放')}
                                >
                                    <Target className="w-4 h-4" />
                                </button>
                            )}
                            {queue.length > 0 && onClearQueue && (
                                <div
                                    className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] h-8 rounded-lg overflow-hidden ${showConfirmClear
                                            ? 'bg-red-500/10 dark:bg-red-500/20 border border-red-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.15)] w-[70px]'
                                            : 'border border-transparent w-8'
                                        }`}
                                >
                                    <div className="flex items-center min-w-[70px]">
                                        <button
                                            onClick={handleClearClick}
                                            className={`w-8 h-8 flex items-center justify-center transition-all duration-300 rounded-lg ${showConfirmClear
                                                ? 'text-red-500 hover:bg-red-500/10'
                                                : 'text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10'
                                                }`}
                                            title={showConfirmClear ? t('common.confirm_clear', '确认清空') : t('fullPlayer.queue.clearAll', '清空队列')}
                                        >
                                            <div className="relative w-4 h-4">
                                                <Check className={`absolute inset-0 w-4 h-4 transition-all duration-300 transform ${showConfirmClear ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-45 opacity-0'}`} />
                                                <Trash2 className={`absolute inset-0 w-4 h-4 transition-all duration-300 transform ${showConfirmClear ? 'scale-50 rotate-45 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} />
                                            </div>
                                        </button>
                                        <div className={`flex items-center transition-all duration-500 ${showConfirmClear ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                            <div className="w-[1px] h-4 bg-red-500/20 mx-0.5" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowConfirmClear(false);
                                                }}
                                                className="w-7 h-7 flex items-center justify-center text-red-500/50 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--glass-highlight)] rounded-full transition-colors">
                        <X className="w-6 h-6 text-[var(--text-secondary)]" />
                    </button>
                </div>
                <div ref={scrollContainerRef} className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {queue.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                            <ListMusic className="w-16 h-16 mb-4" />
                            <p className="text-lg font-medium">{t('fullPlayer.queue.empty', '队列为空')}</p>
                        </div>
                    ) : (
                        queue.map((track, index) => (
                            <QueueTrackItem
                                key={`${track.id}-${index}`}
                                track={track}
                                index={index}
                                isCurrent={track.id === currentTrack.id}
                                isPlaying={isPlaying}
                                onPlayTrack={onPlayTrack}
                                onRemoveTrack={onRemoveTrack}
                                t={t}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

interface QueueTrackItemProps {
    track: Track;
    index: number;
    isCurrent: boolean;
    isPlaying: boolean;
    onPlayTrack: (track: Track) => void;
    onRemoveTrack?: (index: number) => void;
    t: any;
}

const QueueTrackItem = React.memo<QueueTrackItemProps>(({
    track,
    index,
    isCurrent,
    isPlaying,
    onPlayTrack,
    onRemoveTrack,
    t
}) => {
    const trackColor = getTrackGradient(track.id);

    return (
        <div
            data-active={isCurrent ? "true" : "false"}
            onClick={() => onPlayTrack(track)}
            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all group relative ${isCurrent ? 'bg-[var(--accent-color)]/10 dark:bg-[var(--accent-color)]/20 shadow-[0_4px_20px_rgba(var(--accent-rgb),0.05)]' : 'hover:bg-[var(--glass-highlight)]'}`}
        >
            {/* Vertical Glow Indicator */}
            {isCurrent && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--accent-color)] rounded-r-full shadow-[0_0_15px_var(--accent-color)]" />
            )}

            <div className="text-sm font-mono text-[var(--text-muted)] w-4 pl-1">{index + 1}</div>
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${trackColor} flex-shrink-0 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform relative overflow-hidden`}>
                {track.cover && (
                    <img src={track.cover} alt={track.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className={`absolute inset-0 flex items-center justify-center ${isCurrent && isPlaying ? 'bg-black/40' : 'bg-black/20 opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    {isCurrent && isPlaying ? (
                        <div className="flex gap-0.5 items-end h-4">
                            <div className="w-0.5 bg-white animate-[music-bar_0.6s_ease-in-out_infinite] h-full"></div>
                            <div className="w-0.5 bg-white animate-[music-bar_0.8s_ease-in-out_infinite] h-2/3"></div>
                            <div className="w-0.5 bg-white animate-[music-bar_0.7s_ease-in-out_infinite] h-5/6"></div>
                        </div>
                    ) : (
                        <Play className="w-4 h-4 text-white fill-current" />
                    )}
                </div>
            </div>
            <div className="min-w-0 flex-1 pr-2">
                <div className={`font-bold truncate ${isCurrent ? 'text-[var(--accent-color)]' : 'text-[var(--text-main)]'}`}>{track.title}</div>
                <div className="text-sm text-[var(--text-secondary)] truncate">{track.artist}</div>
            </div>

            {/* Right Side Actions: Duration / Remove */}
            <div className="flex items-center gap-2">
                <div className="text-xs font-mono text-[var(--text-muted)] group-hover:hidden block">{track.duration}</div>
                {onRemoveTrack && (
                    <button
                        className="p-2 rounded-full hidden group-hover:block hover:bg-[var(--glass-border)] transition-colors text-[var(--text-muted)] hover:text-red-500"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTrack(index);
                        }}
                        title={t('fullPlayer.queue.remove')}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
});

QueueTrackItem.displayName = 'QueueTrackItem';

export default QueuePanel;
