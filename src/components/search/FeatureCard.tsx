import React from 'react';
import { Play, LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    title: string;
    description?: string;
    subtitle?: string;
    gradient: string;
    icon?: LucideIcon;
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
    title,
    description,
    subtitle,
    gradient,
    icon: Icon,
    size = 'md',
    onClick
}) => {
    const sizeClasses = {
        sm: 'h-40 p-6',
        md: 'h-56 p-8',
        lg: 'h-64 p-8',
    };

    const titleClasses = {
        sm: 'text-2xl',
        md: 'text-3xl',
        lg: 'text-4xl',
    };

    return (
        <div
            onClick={onClick}
            className={`${sizeClasses[size]} rounded-2xl ${gradient} relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform flex flex-col justify-between`}
        >
            <div className="relative z-10">
                {subtitle && (
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">{subtitle}</span>
                )}
                <h2 className={`${titleClasses[size]} font-bold mt-2`}>{title}</h2>
                {description && (
                    <p className="text-white/70 mt-1">{description}</p>
                )}
            </div>

            {Icon && (
                <Icon className="w-12 h-12 opacity-50" />
            )}

            {/* Play Button on Hover */}
            <Play className="absolute bottom-4 right-4 w-10 h-10 bg-white text-black rounded-full p-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg" />
        </div>
    );
};

export default FeatureCard;
