import React, { useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';

interface VolumeControlProps {
    className?: string;
    orientation?: 'vertical' | 'horizontal';
    popoverDirection?: 'up' | 'down' | 'left' | 'right';
}

const VolumeControl: React.FC<VolumeControlProps> = ({
    className = '',
    orientation = 'vertical',
    popoverDirection = 'up'
}) => {
    const [showVolume, setShowVolume] = useState(false);
    const { volume, setVolume } = usePlayerStore();

    const getIcon = () => {
        if (volume === 0) return <VolumeX className="w-5 h-5" />;
        if (volume < 50) return <Volume1 className="w-5 h-5" />;
        return <Volume2 className="w-5 h-5" />;
    };

    const popoverPositionStyles = {
        up: "bottom-14 left-1/2 -translate-x-1/2 mb-2",
        down: "top-14 left-1/2 -translate-x-1/2 mt-2",
        left: "right-14 top-1/2 -translate-y-1/2 mr-2",
        right: "left-14 top-1/2 -translate-y-1/2 ml-2"
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setShowVolume(!showVolume)}
                className={`btn-icon transition-colors ${showVolume ? 'text-[var(--accent-color)] bg-white/10' : ''}`}
            >
                {getIcon()}
            </button>

            {/* Volume Slider Popup */}
            {showVolume && (
                <div className={`absolute ${popoverPositionStyles[popoverDirection]} w-10 h-40 glass rounded-full flex flex-col items-center py-5 bg-[var(--bg-color)]/95 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-50`}>
                    <div className="flex-1 w-1.5 bg-white/10 rounded-full relative group cursor-pointer">
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
                            className="absolute bottom-0 left-0 right-0 bg-[var(--accent-color)] rounded-full transition-all duration-150"
                            style={{ height: `${volume}%` }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border border-white/20 z-10"></div>
                        </div>
                    </div>
                    <span className="text-[10px] mt-3 font-mono font-bold text-[var(--accent-color)]">{volume}</span>
                </div>
            )}
        </div>
    );
};

export default VolumeControl;
