import React from 'react';

export const LoadingFallback: React.FC = () => {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--glass-border)] border-t-[var(--accent-color)] animate-spin"></div>
            </div>
        </div>
    );
};
