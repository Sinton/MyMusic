import React, { useRef, useEffect } from 'react';
import { ListMusic, Play, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '../../stores/usePlayerStore';

interface MiniQueuePopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MiniQueuePopup: React.FC<MiniQueuePopupProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { queue, currentTrack, isPlaying, setTrack, play, setQueue } = usePlayerStore();
    const popupRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if ((event.target as Element).closest('#queue-toggle-btn')) {
                return;
            }
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Handle auto-scroll only when first opened
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                if (scrollContainerRef.current) {
                    const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]');
                    if (activeElement) {
                        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Quick deterministic color assignment based on track/song ID
    const getTrackColor = (id: string | number) => {
        const colors = [
            'from-indigo-500 to-purple-500',
            'from-pink-500 to-rose-500',
            'from-blue-500 to-cyan-500',
            'from-amber-500 to-orange-500',
            'from-emerald-500 to-teal-500'
        ];
        let numericId;
        if (typeof id === 'string') {
            numericId = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        } else {
            numericId = id;
        }
        return colors[numericId % colors.length];
    };

    if (!isOpen) return null;

    const handleRemoveTrack = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        const removedTrack = queue[index];
        const newQueue = queue.filter((_, i) => i !== index);
        setQueue(newQueue);

        // If they removed everything, close the popup
        if (newQueue.length === 0) {
            onClose();
        } else if (removedTrack.id === currentTrack.id) {
            // Optional: if you removed the current track, switch to the next track available at that index
            const nextTrack = newQueue[index] || newQueue[0];
            setTrack(nextTrack);
            play();
        }
    };

    return (
        <div
            ref={popupRef}
            className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-80 max-h-[500px] glass rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[var(--glass-border)] animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100]"
        >
            <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--glass-highlight)]">
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <ListMusic className="w-4 h-4 text-[var(--accent-color)]" />
                    {t('playerBar.nextUp', '接下来播放')}
                </h3>
            </div>
            <div ref={scrollContainerRef} className="overflow-y-auto max-h-[440px] p-2 space-y-1 custom-scrollbar-none">
                {queue.map((track, index) => {
                    const isCurrent = track.id === currentTrack.id;
                    return (
                        <div
                            key={`${track.id}-${index}`}
                            data-active={isCurrent ? "true" : "false"}
                            onClick={() => {
                                setTrack(track);
                                play();
                                onClose();
                            }}
                            className={`
                                flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all group relative
                                ${isCurrent ? 'bg-[var(--accent-color)]/10 dark:bg-[var(--accent-color)]/20' : 'hover:bg-[var(--glass-highlight)]'}
                            `}
                        >
                            {/* Active Track Indicator Bar */}
                            {isCurrent && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--accent-color)] rounded-r-full shadow-[0_0_10px_var(--accent-color)] z-10" />
                            )}
                            <div className={`w-10 h-10 rounded bg-gradient-to-br ${getTrackColor(track.id)} flex-shrink-0 flex items-center justify-center relative overflow-hidden`}>
                                {track.cover && (
                                    <img src={track.cover} alt={track.title} className="absolute inset-0 w-full h-full object-cover" />
                                )}
                                <div className={`absolute inset-0 flex items-center justify-center ${isCurrent && isPlaying ? 'bg-black/40' : 'bg-black/0 group-hover:bg-black/30'} transition-colors`}>
                                    {isCurrent && isPlaying ? (
                                        <div className="flex gap-0.5 items-end h-3">
                                            <div className="w-0.5 bg-white animate-[music-bar_0.6s_ease-in-out_infinite] h-full"></div>
                                            <div className="w-0.5 bg-white animate-[music-bar_0.8s_ease-in-out_infinite] h-2/3"></div>
                                            <div className="w-0.5 bg-white animate-[music-bar_0.7s_ease-in-out_infinite] h-5/6"></div>
                                        </div>
                                    ) : (
                                        <Play className="w-3 h-3 text-white fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1 pr-1">
                                <div className={`text-xs font-medium truncate ${isCurrent ? 'text-[var(--accent-color)]' : 'text-[var(--text-main)]'}`}>
                                    {track.title}
                                </div>
                                <div className="text-[10px] text-[var(--text-secondary)] truncate">
                                    {track.artist}
                                </div>
                            </div>

                            <button
                                onClick={(e) => handleRemoveTrack(e, index)}
                                className="p-1.5 rounded-full hidden group-hover:block hover:bg-[var(--glass-border)] transition-colors text-[var(--text-muted)] hover:text-red-500"
                                title={t('fullPlayer.queue.remove', '移除')}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
