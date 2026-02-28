import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';

interface VolumeControlProps {
    className?: string;
    orientation?: 'vertical' | 'horizontal';
    popoverDirection?: 'up' | 'down' | 'left' | 'right';
}

const VolumeControl: React.FC<VolumeControlProps> = ({
    className = '',
    popoverDirection = 'up'
}) => {
    const [showVolume, setShowVolume] = useState(false);
    const [prevVolume, setPrevVolume] = useState(80);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { volume, setVolume } = usePlayerStore();

    const getIcon = () => {
        if (volume === 0) return <VolumeX className="w-5 h-5" />;
        if (volume < 50) return <Volume1 className="w-5 h-5" />;
        return <Volume2 className="w-5 h-5" />;
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShowVolume(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowVolume(false);
        }, 300);
    };

    const handleToggleMute = () => {
        if (volume > 0) {
            setPrevVolume(volume);
            setVolume(0);
        } else {
            setVolume(prevVolume > 0 ? prevVolume : 80);
        }
    };

    const popoverPositionStyles = {
        up: "bottom-14 left-1/2 -translate-x-1/2 mb-2",
        down: "top-14 left-1/2 -translate-x-1/2 mt-2",
        left: "right-14 top-1/2 -translate-y-1/2 mr-2",
        right: "left-14 top-1/2 -translate-y-1/2 ml-2"
    };

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                onClick={handleToggleMute}
                className={`btn-icon transition-colors hover:text-[var(--accent-color)] ${showVolume ? 'text-[var(--accent-color)] bg-[var(--glass-highlight)]' : ''}`}
            >
                {getIcon()}
            </button>

            {/* Volume Slider Popup */}
            {showVolume && (
                <div className={`absolute ${popoverPositionStyles[popoverDirection]} w-10 h-40 glass rounded-2xl flex flex-col items-center py-4 bg-[var(--bg-color)]/95 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-50`}>
                    <div className="flex-1 w-1.5 bg-[var(--glass-border)] rounded-full relative group cursor-pointer">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(parseInt(e.target.value))}
                            className="absolute -inset-x-4 -inset-y-2 w-10 h-32 cursor-pointer opacity-0 z-20"
                            style={{
                                appearance: 'slider-vertical' as any,
                                writingMode: 'bt-lr' as any,
                                margin: 0,
                                transform: 'translateX(-12px)'
                            }}
                        />
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-[var(--accent-color)] rounded-full"
                            style={{ height: `${volume}%` }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[var(--text-main)] rounded-full shadow-lg border border-[var(--glass-border)] z-10"></div>
                        </div>
                    </div>
                    <span className="text-[10px] mt-3 font-mono font-bold text-[var(--accent-color)]">{volume}</span>
                </div>
            )}
        </div>
    );
};

export default VolumeControl;
