import React from 'react';
import { X, ListMusic, Play } from 'lucide-react';
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
}

const QueuePanel: React.FC<QueuePanelProps> = ({
    isOpen,
    onClose,
    queue,
    currentTrack,
    isPlaying,
    onPlayTrack
}) => {
    const { t } = useTranslation();
    const [showShadow, setShowShadow] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setShowShadow(true);
        } else {
            const timer = setTimeout(() => setShowShadow(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <div className={`absolute inset-y-0 right-0 w-full lg:w-[450px] glass-drawer border-l border-[var(--glass-border)] z-[100] transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${showShadow ? 'shadow-[-20px_0_50px_rgba(0,0,0,0.3)]' : ''}`}>
            <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <ListMusic className="w-6 h-6 text-[var(--accent-color)]" />
                        <h3 className="text-xl font-bold text-[var(--text-main)]">{t('fullPlayer.queue.nextUp')}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--glass-highlight)] rounded-full transition-colors">
                        <X className="w-6 h-6 text-[var(--text-secondary)]" />
                    </button>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {queue.map((track, index) => {
                        const isCurrent = track.id === currentTrack.id;
                        const trackColor = getTrackGradient(track.id);
                        return (
                            <div
                                key={`${track.id}-${index}`}
                                onClick={() => onPlayTrack(track)}
                                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all group relative ${isCurrent ? 'bg-[var(--accent-color)]/10 dark:bg-[var(--accent-color)]/20' : 'hover:bg-[var(--glass-highlight)]'}`}
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
                                <div className="min-w-0 flex-1">
                                    <div className={`font-bold truncate ${isCurrent ? 'text-[var(--accent-color)]' : 'text-[var(--text-main)]'}`}>{track.title}</div>
                                    <div className="text-sm text-[var(--text-secondary)] truncate">{track.artist}</div>
                                </div>
                                <div className="text-xs font-mono text-[var(--text-muted)]">{track.duration}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QueuePanel;
