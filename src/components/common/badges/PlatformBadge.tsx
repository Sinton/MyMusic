import React from 'react';
import { Music } from 'lucide-react';
import neteaseIcon from '../../../assets/netease_music.png';
import qqIcon from '../../../assets/qq_music.png';
import sodaIcon from '../../../assets/soda_music.png';
import vibeLogo from '../../../assets/logo_bg.png';

export interface PlatformBadgeProps {
    name: string;
    color?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showInitial?: boolean;
    connected?: boolean;
    useIcon?: boolean;
    className?: string;
}

const iconMap: Record<string, string> = {
    'netease': neteaseIcon,
    'NetEase Cloud': neteaseIcon,
    'NetEase': neteaseIcon,
    'qq': qqIcon,
    'QQ Music': qqIcon,
    'soda': sodaIcon,
    'Soda Music': sodaIcon,
    'Soda': sodaIcon,
    '汽水音乐': sodaIcon,
    'local': vibeLogo,
    'Vibe': vibeLogo,
};

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
    name,
    color = 'var(--accent-color)',
    size = 'md',
    showInitial = true,
    connected = true,
    useIcon = true,
    className = '',
}) => {
    const sizeClasses = {
        xs: 'w-4 h-4 text-[8px]',
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm',
        xl: 'w-16 h-16 text-lg',
    };

    const iconSizes = {
        xs: 'w-2.5 h-2.5',
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
        xl: 'w-8 h-8',
    };

    const icon = iconMap[name];

    return (
        <div
            className={`
        ${sizeClasses[size]} 
        rounded-lg flex items-center justify-center font-bold text-white shadow-sm
        transition-opacity overflow-hidden
        ${!connected && 'opacity-50 grayscale'}
        ${className}
      `}
            style={{ backgroundColor: !icon ? (connected ? color : '#333') : 'transparent' }}
            title={name}
        >
            {useIcon && icon ? (
                <img src={icon} alt={name} className="w-full h-full object-cover" />
            ) : showInitial ? (
                name?.[0] || '?'
            ) : (
                <Music className={iconSizes[size]} />
            )}
        </div>
    );
};

export default PlatformBadge;
