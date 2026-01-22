import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface VipBadgeProps {
    variant?: 'default' | 'outline' | 'gradient';
    animated?: boolean;
}

const VipBadge: React.FC<VipBadgeProps> = ({ variant = 'default', animated = false }) => {
    const baseClasses = 'text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold';

    const variantClasses = {
        default: 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-white',
        outline: 'text-[var(--accent-color)] border border-[var(--accent-color)]',
        gradient: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black',
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${animated ? 'animate-pulse' : ''}`}>
            VIP <BadgeCheck className="w-3 h-3" />
        </span>
    );
};

export default VipBadge;
