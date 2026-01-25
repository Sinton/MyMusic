import React, { ReactNode } from 'react';
import { GrainyNoise } from './GrainyNoise';

interface ImmersiveHeaderProps {
    backgroundImage?: string;
    children: ReactNode;
    height?: string;
}

export const ImmersiveHeader: React.FC<ImmersiveHeaderProps> = ({
    backgroundImage,
    children,
    height = '520px'
}) => {
    return (
        <div className={`relative w-full mb-16 group -mt-20`} style={{ height }}>
            <GrainyNoise />
            <div
                className="absolute inset-0 rounded-b-[4rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border-b border-white/10 overflow-hidden isolate transform-gpu"
                style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
            >
                <div
                    className="absolute inset-0 bg-cover bg-center blur-[100px] scale-150 opacity-100 dark:opacity-60 transition-all duration-1000 group-hover:scale-125"
                    style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
                />
                <div className="absolute inset-0 bg-white/10 dark:bg-transparent backdrop-blur-[80px]" />

                <div className="absolute inset-0 overflow-hidden opacity-60 dark:opacity-40 mix-blend-overlay dark:mix-blend-soft-light">
                    <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,var(--accent-color)_0%,transparent_60%)] animate-[halo-rotate_20s_linear_infinite] opacity-50" />
                    <div className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,#4f46e5_0%,transparent_60%)] animate-[halo-rotate_25s_linear_infinite_reverse] opacity-40" />
                </div>

                <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ filter: 'url(#grainy-noise)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-transparent" />

                {/* Finishing Gradients from AlbumDetailView */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/[0.03] dark:to-[var(--bg-color)]/20 shadow-inner" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-color)]/10 via-transparent to-[var(--bg-color)]/10" />

                {/* Interior Border Highlight */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/30 dark:ring-white/10 rounded-b-[4rem]" />
            </div>

            {/* Foreground Content */}
            {children}
        </div>
    );
};
