import React from 'react';

type QualityLevel = 'master' | 'hires' | 'lossless' | 'high' | 'normal';

interface QualityBadgeProps {
    label: string;
    className?: string;
}

const getQualityLevel = (label: string): QualityLevel => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('master')) return 'master';
    if (normalizedLabel.includes('hi-res') || normalizedLabel.includes('hires')) return 'hires';
    if (normalizedLabel.includes('flac') || normalizedLabel.includes('sq') || normalizedLabel.includes('lossless')) return 'lossless';
    if (normalizedLabel.includes('320') || normalizedLabel.includes('hq') || normalizedLabel.includes('high')) return 'high';
    return 'normal';
};

const qualityStyles: Record<QualityLevel, string> = {
    master: 'bg-gradient-to-r from-yellow-600/20 to-amber-500/20 text-amber-400 border-amber-500/30',
    hires: 'bg-[rgba(200,150,50,0.2)] text-[#fbbf24] border-[rgba(200,150,50,0.3)]',
    lossless: 'bg-[rgba(50,200,50,0.2)] text-[#4ade80] border-[rgba(50,200,50,0.3)]',
    high: 'bg-[rgba(50,100,200,0.2)] text-[#60a5fa] border-[rgba(50,100,200,0.3)]',
    normal: 'bg-[rgba(100,100,100,0.2)] text-[var(--text-secondary)] border-[rgba(100,100,100,0.3)]',
};

const QualityBadge: React.FC<QualityBadgeProps> = ({ label, className = '' }) => {
    const level = getQualityLevel(label);

    return (
        <span
            className={`
        text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase border
        ${qualityStyles[level]}
        ${className}
      `}
        >
            {label}
        </span>
    );
};

export default QualityBadge;
