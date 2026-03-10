import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { FolderPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

interface MagneticDropzoneProps {
    onDrop: (paths: string[]) => void;
    onBrowse: () => void;
    isExternalHover?: boolean;
    externalPos?: { x: number, y: number } | null;
}

const MagneticDropzone: React.FC<MagneticDropzoneProps> = ({ onDrop, onBrowse, isExternalHover, externalPos }) => {
    const { t } = useTranslation();
    const [isInternalHover, setIsInternalHover] = useState(false);
    const isHovering = isInternalHover || isExternalHover;
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);

    // Mouse tracking for "Warping" influence (center offset)
    const mouseX = useSpring(0, { stiffness: 100, damping: 30 });
    const mouseY = useSpring(0, { stiffness: 100, damping: 30 });

    // Sync external position with internal springs
    useEffect(() => {
        if (externalPos && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const relX = (externalPos.x - rect.left - rect.width / 2) / 10;
            const relY = (externalPos.y - rect.top - rect.height / 2) / 10;

            // Constrain relX and relY to prevent excessive tilting from global edge influence
            const clampedX = Math.max(-100, Math.min(100, relX));
            const clampedY = Math.max(-100, Math.min(100, relY));

            mouseX.set(clampedX);
            mouseY.set(clampedY);
        } else if (!isInternalHover) {
            mouseX.set(0);
            mouseY.set(0);
        }
    }, [externalPos, isInternalHover]);

    // Derived values for the dynamic "Magnetic" tilt
    const dynamicRotate = useTransform(mouseX, [-40, 40], [-20, 20]);
    const dynamicScale = useTransform(mouseY, [-20, 20], [1.1, 1.25]);

    const createExplosion = (x: number, y: number) => {
        const colors = ['#6366f1', '#a855f7', '#ec4899', '#ffffff'];
        for (let i = 0; i < 50; i++) {
            particles.current.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 1.0,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrame: number;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.current = particles.current.filter(p => p.life > 0);
            particles.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity
                p.life -= 0.02;

                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrame = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsInternalHover(true);

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const relX = (e.clientX - rect.left - rect.width / 2) / 10;
            const relY = (e.clientY - rect.top - rect.height / 2) / 10;
            mouseX.set(relX);
            mouseY.set(relY);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsInternalHover(false);
        mouseX.set(0);
        mouseY.set(0);

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            createExplosion(e.clientX - rect.left, e.clientY - rect.top);
        }

        // Handle file extraction (Tauri specific logic usually handled in View, 
        // but here we just pass the event data up if possible or mock for now)
        // In LocalMusicView, we use tauri://drop listener, so this is mostly for visual.
    };

    return (
        <div className="relative w-full overflow-hidden rounded-3xl group">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-20 pointer-events-none"
                width={800}
                height={400}
            />



            <motion.div
                ref={containerRef}
                onDragOver={handleDragOver}
                onDragLeave={() => { setIsInternalHover(false); mouseX.set(0); mouseY.set(0); }}
                onDrop={handleDrop}
                className={`w-full aspect-[21/9] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-500 overflow-hidden cursor-pointer active:scale-[0.99] ${isHovering
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 scale-[1.01] shadow-2xl shadow-[var(--accent-color)]/20'
                    : 'border-[var(--glass-border)] bg-[var(--glass-highlight)]/5 hover:border-[var(--accent-color)]/40 hover:bg-[var(--accent-color)]/[0.04]'
                    }`}
                onClick={onBrowse}
            >
                {/* Background Fluid Glow */}
                <motion.div
                    animate={{
                        scale: isHovering ? 1.5 : 1,
                        opacity: isHovering ? 0.3 : 0.1,
                    }}
                    className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)] to-purple-600 blur-[100px] pointer-events-none"
                />

                <motion.div
                    className="flex flex-col items-center justify-center gap-8 z-10"
                    style={{ x: mouseX, y: mouseY }}
                >
                    <div className="relative mb-16">
                        {/* Heartbeat Rings - Synced with pulse */}
                        {!isHovering && (
                            <>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0, 0.25, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        times: [0, 0.1, 0.4],
                                        ease: "easeOut",
                                    }}
                                    className="absolute inset-[-10%] rounded-full border-2 border-[var(--accent-color)]/20 shadow-[0_0_15px_var(--accent-color)]/5"
                                />
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0, 0.15, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        times: [0.12, 0.25, 0.5],
                                        ease: "easeOut",
                                    }}
                                    className="absolute inset-[-5%] rounded-full border-2 border-[var(--accent-color)]/10"
                                />
                            </>
                        )}

                        <motion.div
                            style={{
                                rotate: isHovering ? dynamicRotate : 0,
                                scale: isHovering ? dynamicScale : 1
                            }}
                            animate={isHovering ? {} : {
                                scale: [1, 1.1, 1, 1.18, 1, 1],
                                rotate: [0, -1, 0, 1.5, 0, 0],
                            }}
                            transition={isHovering
                                ? { type: "spring", stiffness: 400, damping: 15 }
                                : {
                                    duration: 3,
                                    repeat: Infinity,
                                    times: [0, 0.06, 0.12, 0.18, 0.3, 1],
                                    ease: "easeInOut"
                                }
                            }
                            className={`p-10 rounded-full bg-[var(--glass-highlight)]/10 backdrop-blur-xl border border-white/10 transition-colors duration-500 relative z-10 ${isHovering ? 'text-[var(--accent-color)] shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'text-[var(--text-muted)]'}`}
                        >
                            <FolderPlus className="w-16 h-16" />

                            {/* Inner Pulse Glow */}
                            {!isHovering && (
                                <motion.div
                                    animate={{ opacity: [0, 0.4, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, times: [0.15, 0.2, 0.4] }}
                                    className="absolute inset-0 rounded-full bg-[var(--accent-color)]/5 blur-xl"
                                />
                            )}
                        </motion.div>
                    </div>

                    <div className="text-center space-y-3">
                        <motion.h3
                            animate={{ y: isHovering ? -5 : 0 }}
                            className="text-3xl font-bold text-[var(--text-main)] tracking-tight"
                        >
                            {t('local.no_tracks_title')}
                        </motion.h3>
                        <p className="text-[var(--text-secondary)] text-sm max-w-md px-4 leading-relaxed opacity-80">
                            {t('local.no_tracks_desc')}
                        </p>
                    </div>
                </motion.div>



                {/* Warp Grid Lines */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, var(--accent-color) 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                    }}
                />
            </motion.div>
        </div>
    );
};

export default MagneticDropzone;
