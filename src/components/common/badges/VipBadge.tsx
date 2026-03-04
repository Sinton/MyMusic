import React from 'react';

interface VipBadgeProps {
    variant?: 'default' | 'outline' | 'gradient';
    animated?: boolean;
    platform?: string;
}

const VipBadge: React.FC<VipBadgeProps> = ({ variant = 'default', animated = false, platform = '' }) => {
    const isNetease = platform.toLowerCase().includes('netease');
    const isQQ = platform.toLowerCase().includes('qq');

    const baseClasses = 'text-[9px] px-1.5 py-0.5 rounded font-black transition-all duration-300 tracking-wider';

    const getColors = () => {
        if (variant === 'outline') {
            if (isNetease) return 'text-[#e60026] border border-[#e60026]/40';
            if (isQQ) return 'text-[#31c27c] border border-[#31c27c]/40';
            return 'text-[var(--accent-color)] border border-[var(--accent-color)]/40';
        }
        if (variant === 'gradient') {
            if (isNetease) return 'bg-gradient-to-r from-red-600 to-red-400 text-white';
            if (isQQ) return 'bg-gradient-to-r from-emerald-600 to-green-400 text-white';
            return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black';
        }
        // Default
        if (isNetease) return 'bg-[#e60026] text-white';
        if (isQQ) return 'bg-[#31c27c] text-white';
        return 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-white';
    };

    return (
        <span className={`${baseClasses} ${getColors()} ${animated ? 'animate-pulse' : ''}`}>
            VIP
        </span>
    );
};

export default VipBadge;
