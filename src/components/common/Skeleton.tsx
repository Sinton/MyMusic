import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rectangular' | 'circular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height
}) => {
    const baseClasses = "animate-pulse bg-black/10 dark:bg-white/10";
    const variantClasses = {
        text: "rounded-md",
        rectangular: "rounded-xl",
        circular: "rounded-full"
    };

    const style: React.CSSProperties = {
        width: width,
        height: height
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
                <Skeleton width={48} height={48} variant="rectangular" className="rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton width="40%" height={20} className="rounded" />
                    <Skeleton width="25%" height={16} className="rounded" />
                </div>
            </div>
        ))}
    </div>
);
