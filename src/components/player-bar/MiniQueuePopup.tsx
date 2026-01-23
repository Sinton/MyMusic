import React, { useRef, useEffect } from 'react';
import { ListMusic, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '../../stores/usePlayerStore';


interface MiniQueuePopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MiniQueuePopup: React.FC<MiniQueuePopupProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { queue, currentTrack, isPlaying, setTrack, play } = usePlayerStore();
    const popupRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
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

    if (!isOpen) return null;

    const getTrackColor = (id: number) => {
        const colors = [
            'from-indigo-500 to-purple-500',
            'from-pink-500 to-rose-500',
            'from-blue-500 to-cyan-500',
            'from-amber-500 to-orange-500',
            'from-emerald-500 to-teal-500'
        ];
        return colors[(id - 1) % colors.length];
    };

    return (
        <div
            ref={popupRef}
            className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-80 max-h-[500px] glass rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[var(--glass-border)] animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100]"
        >
            <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--glass-highlight)]">
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <ListMusic className="w-4 h-4 text-[var(--accent-color)]" />
                    {t('playerBar.nextUp')}
                </h3>
            </div>
            <div className="overflow-y-auto max-h-[440px] p-2 space-y-1 custom-scrollbar-none">
                {queue.map((track) => {
                    const isCurrent = track.id === currentTrack.id;
                    return (
                        <div
                            key={track.id}
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
                            <div className={`w-10 h-10 rounded bg-gradient-to-br ${getTrackColor(track.id)} flex-shrink-0 flex items-center justify-center`}>
                                {isCurrent && isPlaying ? (
                                    <div className="flex gap-0.5 items-end h-3">
                                        <div className="w-0.5 bg-[var(--text-main)] animate-[music-bar_0.6s_ease-in-out_infinite] h-full"></div>
                                        <div className="w-0.5 bg-[var(--text-main)] animate-[music-bar_0.8s_ease-in-out_infinite] h-2/3"></div>
                                        <div className="w-0.5 bg-[var(--text-main)] animate-[music-bar_0.7s_ease-in-out_infinite] h-5/6"></div>
                                    </div>
                                ) : (
                                    <Play className={`w-3 h-3 text-[var(--text-main)] fill-current opacity-0 group-hover:opacity-100 transition-opacity`} />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className={`text-xs font-medium truncate ${isCurrent ? 'text-[var(--accent-color)]' : 'text-[var(--text-main)]'}`}>
                                    {track.title}
                                </div>
                                <div className="text-[10px] text-[var(--text-secondary)] truncate">
                                    {track.artist}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
