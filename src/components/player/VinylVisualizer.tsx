import React from 'react';

interface VinylVisualizerProps {
    isPlaying: boolean;
    visualizerEnabled: boolean;
    trackId: number;
}

const VinylVisualizer: React.FC<VinylVisualizerProps> = React.memo(({
    isPlaying,
    visualizerEnabled,
    trackId
}) => {
    return (
        <div className="w-[50vh] h-[50vh] relative group flex items-center justify-center">
            {/* The Halo Visualizer */}
            {visualizerEnabled && (
                <div className="absolute inset-[-20%] z-0 pointer-events-none flex items-center justify-center">
                    <div className={`absolute inset-[-5%] rounded-full bg-[var(--accent-color)] blur-[100px] mix-blend-screen transition-all duration-500 ${isPlaying ? 'animate-[halo-pulse_1.2s_ease-out_infinite]' : 'opacity-20'}`}></div>
                    <div className={`absolute inset-[-15%] rounded-full bg-[var(--accent-color)]/30 blur-[130px] mix-blend-screen transition-all duration-1000 ${isPlaying ? 'animate-[halo-pulse_2.4s_ease-out_infinite_0.4s]' : 'opacity-10'}`}></div>
                    <div className={`absolute inset-[10%] rounded-full border-[15px] border-[var(--accent-color)]/30 blur-[30px] mix-blend-screen ${isPlaying ? 'animate-[halo-rotate_20s_linear_infinite,halo-pulse_1.2s_ease-out_infinite]' : 'opacity-5'}`}></div>
                    <div className="relative w-full h-full flex items-center justify-center">
                        {Array.from({ length: 48 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-[1.5px] rounded-full mix-blend-screen transition-all duration-300"
                                style={{
                                    height: isPlaying ? '18%' : '2%',
                                    transformOrigin: 'bottom center',
                                    transform: `rotate(${i * (360 / 48)}deg) translateY(-120%)`,
                                    '--rotation': `${i * (360 / 48)}deg`,
                                    backgroundColor: `var(--accent-color)`,
                                    opacity: isPlaying ? 0.5 : 0.05,
                                    filter: isPlaying ? 'blur(2.5px)' : 'none',
                                    animation: isPlaying ? `music-ring-bar ${0.6 + Math.random() * 0.4}s ease-out infinite` : 'none',
                                    animationDelay: `-${Math.random() * 2}s`,
                                } as React.CSSProperties}
                            ></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Vinyl Record */}
            <div className="absolute inset-0 bg-black/40 rounded-full blur-2xl transform scale-95 group-hover:scale-100 transition-transform duration-700 z-10"></div>
            <div className="w-[45vh] h-[45vh] rounded-full bg-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-[#222] relative overflow-hidden z-20">
                <div className="absolute inset-[10px] border border-[#333] rounded-full opacity-50"></div>
                <div className="absolute inset-[25px] border border-[#333] rounded-full opacity-40"></div>
                <div className="absolute inset-[40px] border border-[#333] rounded-full opacity-30"></div>
                <div className="w-full h-full animate-spin-slow-variable relative" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
                    <div className="absolute inset-[25%] rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-2 border-[#111] z-20">
                        <div className={`w-full h-full ${trackId === 1 ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : 'bg-gradient-to-tr from-blue-400 to-emerald-400'}`}>
                            <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        </div>
                        <div className="absolute w-4 h-4 bg-[#050505] rounded-full border border-white/10 shadow-inner z-10"></div>
                    </div>
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.08)_45deg,transparent_90deg,rgba(255,255,255,0.08)_135deg,transparent_180deg,rgba(255,255,255,0.08)_225deg,transparent_270deg,rgba(255,255,255,0.08)_315deg,transparent_360deg)] rounded-full z-10"></div>
                    <div className="absolute inset-0 bg-[conic-gradient(from_20deg,transparent_0deg,rgba(255,255,255,0.03)_60deg,transparent_120deg)] rounded-full z-10"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-full pointer-events-none z-30"></div>
            </div>

            {/* Tonearm */}
            <div
                className={`absolute -top-10 -right-10 w-48 h-64 pointer-events-none transition-transform duration-1000 cubic-bezier(0.23, 1, 0.32, 1) z-20 will-change-transform ${isPlaying ? 'rotate-[32deg]' : 'rotate-0'}`}
                style={{ transformOrigin: '80% 20%' }}
            >
                <div className="absolute top-4 right-4 w-16 h-16 bg-[#2a2a2a] rounded-full border border-white/10 shadow-2xl flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#333] to-[#111] rounded-full shadow-inner border border-white/5 flex items-center justify-center">
                        <div className="w-4 h-4 bg-[var(--accent-color)] rounded-full blur-[2px] opacity-40"></div>
                    </div>
                </div>
                <div className="absolute top-12 right-12 w-3 h-48 bg-gradient-to-r from-[#ccc] via-[#fff] to-[#ccc] rounded-full shadow-xl origin-top transform -rotate-[18deg]">
                    <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-6 h-12 bg-[#111] rounded-sm border border-white/10"></div>
                    <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4 h-16 bg-gradient-to-r from-[#aaa] to-[#fff] origin-top rotate-[25deg] rounded-b-lg shadow-lg">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 bg-[#000] rounded-sm border border-white/5 flex items-center justify-center">
                            <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default VinylVisualizer;
