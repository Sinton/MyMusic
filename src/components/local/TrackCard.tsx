import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Music, Play } from 'lucide-react';
import { LocalTrack } from '../../stores/useLocalMusicStore';
import { useLocalCoverUrl } from '../../hooks/useLocalCoverUrl';

interface TrackCardProps {
    track: LocalTrack;
    index: number;
    onClick: () => void;
    hoveredIndex: number | null;
    setHoveredIndex: (index: number | null) => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, index, onClick, hoveredIndex, setHoveredIndex }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const resolvedCover = useLocalCoverUrl(track.cover, track.path);
    const [glowColor, setGlowColor] = useState('rgba(99, 102, 241, 0.2)'); // Default indigo

    // 3D Tilt Values
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [25, -25]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-25, 25]), { stiffness: 150, damping: 20 });

    // Light effect for 3D card
    const spotlightX = useSpring(useTransform(mouseX, [0, 100], [0, 100]), { stiffness: 200, damping: 30 });
    const spotlightY = useSpring(useTransform(mouseY, [0, 100], [0, 100]), { stiffness: 200, damping: 30 });

    // Gravity Repulsion Shift
    const isHoveredBySelf = hoveredIndex === index;
    const repulsionX = useSpring(0, { stiffness: 100, damping: 25 });
    const repulsionY = useSpring(0, { stiffness: 100, damping: 25 });

    useEffect(() => {
        if (hoveredIndex !== null && hoveredIndex !== index) {
            // Simplified repulsion logic (based on index distance in grid)
            // Real repulsion would need coordinates, but we can simulate based on index
            // LocalMusicView has a grid of 6 cols on XL
            const dist = Math.abs(hoveredIndex - index);
            if (dist === 1) { // Immediate horizontal neighbor
                repulsionX.set(hoveredIndex < index ? 10 : -10);
            } else if (dist === 6) { // Immediate vertical neighbor
                repulsionY.set(hoveredIndex < index ? 10 : -10);
            } else {
                repulsionX.set(0);
                repulsionY.set(0);
            }
        } else {
            repulsionX.set(0);
            repulsionY.set(0);
        }
    }, [hoveredIndex, index]);

    // Color Extraction (Simple average color from cover)
    useEffect(() => {
        if (resolvedCover) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = resolvedCover;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.width = 1;
                    canvas.height = 1;
                    ctx.drawImage(img, 0, 0, 1, 1);
                    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                    setGlowColor(`rgba(${r}, ${g}, ${b}, 0.3)`);
                }
            };
        }
    }, [resolvedCover]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;

        const xPct = (mouseXVal / width) - 0.5;
        const yPct = (mouseYVal / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
        mouseX.set((mouseXVal / width) * 100);
        mouseY.set((mouseYVal / height) * 100);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setHoveredIndex(null);
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={isHoveredBySelf
                ? { opacity: 1, scale: 1.05, y: -8 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            transition={isHoveredBySelf
                ? { type: "spring", stiffness: 300, damping: 20 }
                : { delay: index * 0.01, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                perspective: 1200,
                x: repulsionX,
                y: repulsionY
            }}
            className="group relative flex flex-col gap-3 cursor-pointer select-none"
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d'
                }}
                className="aspect-square relative overflow-hidden rounded-2xl bg-[var(--glass-highlight)]/20 shadow-lg transition-shadow duration-500 group-hover:shadow-2xl"
            >
                {/* Dynamic Background Glow */}
                <motion.div
                    animate={{
                        scale: isHoveredBySelf ? 1.2 : 0.8,
                        opacity: isHoveredBySelf ? 1 : 0
                    }}
                    style={{ backgroundColor: glowColor }}
                    className="absolute inset--4 blur-[40px] rounded-full pointer-events-none z-0"
                />

                <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: 'translateZ(40px)' }}>
                    {resolvedCover ? (
                        <div className="w-full h-full aspect-square">
                            <img
                                src={resolvedCover}
                                alt={track.title}
                                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--glass-highlight)]/10 to-transparent">
                            <Music className="w-12 h-12 text-[var(--text-muted)] opacity-30" />
                        </div>
                    )}

                    {/* Spotlight overlay */}
                    <motion.div
                        style={{
                            background: `radial-gradient(circle at ${spotlightX}% ${spotlightY}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
                        }}
                        className="absolute inset-0 pointer-events-none"
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[4px]">
                        <motion.div
                            initial={false}
                            animate={{ scale: isHoveredBySelf ? 1 : 0.8 }}
                            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 shadow-xl"
                        >
                            <Play className="w-7 h-7 fill-current" />
                        </motion.div>
                    </div>
                </div>

                {/* Glass reflections */}
                <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none z-20 overflow-hidden">
                    <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-12" />
                </div>
            </motion.div>

            <div className="flex flex-col gap-0.5 px-1 z-30" style={{ transform: 'translateZ(20px)' }}>
                <h4 className="text-sm font-semibold text-[var(--text-main)] truncate group-hover:text-[var(--accent-color)] transition-colors">
                    {track.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] truncate font-medium">
                    {track.artist}
                </p>
            </div>
        </motion.div>
    );
};

export default TrackCard;
