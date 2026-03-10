import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';

interface WaveformScrubberProps {
    src: string; // This is the local file path
    duration: number; // in seconds
    currentTime: number; // in seconds
    onSeek: (time: number) => void;
    accentColor?: string;
}

const WaveformScrubber: React.FC<WaveformScrubberProps> = ({
    src,
    duration,
    currentTime,
    onSeek,
    accentColor = 'var(--accent-color)'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [waveform, setWaveform] = useState<number[]>([]);

    const [proxyPort, setProxyPort] = useState<number | null>(null);

    // Fetch proxy port on mount
    useEffect(() => {
        invoke<number>('get_proxy_port').then(setProxyPort);
    }, []);

    // Generate Waveform Data
    useEffect(() => {
        if (!src || !proxyPort) return;

        const generateWaveform = async () => {
            try {
                const proxyUrl = `http://localhost:${proxyPort}/stream?path=${encodeURIComponent(src)}`;
                const response = await fetch(proxyUrl);
                const arrayBuffer = await response.arrayBuffer();

                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

                const channelData = audioBuffer.getChannelData(0);
                const samples = 100; // Number of bars to render
                const blockSize = Math.floor(channelData.length / samples);
                const filteredData: number[] = [];

                for (let i = 0; i < samples; i++) {
                    let blockStart = blockSize * i;
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(channelData[blockStart + j]);
                    }
                    filteredData.push(sum / blockSize);
                }

                // Normalize
                const max = Math.max(...filteredData);
                const normalizedData = filteredData.map(n => n / max);

                setWaveform(normalizedData);
            } catch (error) {
                console.error('Failed to generate waveform:', error);
                // Fallback: random waveform
                setWaveform(Array.from({ length: 100 }, () => Math.random() * 0.5 + 0.2));
            }
        };

        generateWaveform();
    }, [src, proxyPort]);

    // Render Waveform
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || waveform.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const barWidth = width / waveform.length;
            const progress = currentTime / duration;

            ctx.clearRect(0, 0, width, height);

            // Get current theme's muted text color for unplayed waveform
            const unplayedColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || 'rgba(128, 128, 128, 0.3)';

            waveform.forEach((val, i) => {
                const x = i * barWidth;
                const barHeight = val * height * 0.8;
                const isPlayed = (i / waveform.length) <= progress;

                // Fluid Connection: Smoothly interpolate color at the edge
                ctx.fillStyle = isPlayed ? accentColor : unplayedColor;

                // Draw Symmetric Bar
                const yTop = (height - barHeight) / 2;

                // Rounded bar effect
                ctx.beginPath();
                ctx.roundRect(x + 1, yTop, barWidth - 2, barHeight, [4]);
                ctx.fill();
            });
        };

        render();
    }, [waveform, currentTime, duration, accentColor]);

    const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        onSeek(pct * duration);
    };

    return (
        <div className="relative w-full h-16 group cursor-pointer" onClick={handleScrub}>
            {/* Background Track */}
            <div className="absolute inset-0 bg-[var(--glass-highlight)]/5 backdrop-blur-sm rounded-xl border border-white/5" />

            <canvas
                ref={canvasRef}
                width={800}
                height={64}
                className="w-full h-full relative z-10"
            />

            {/* Current Time Indicator */}
            <motion.div
                animate={{ left: `${(currentTime / duration) * 100}%` }}
                className="absolute top-0 bottom-0 w-[2px] bg-text-main z-20 shadow-[0_0_10px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none"
            >
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-text-main" />
            </motion.div>

            {/* Hover Tooltip/Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-xl pointer-events-none" />
        </div>
    );
};

export default WaveformScrubber;
