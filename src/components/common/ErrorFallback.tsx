import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';

export const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold text-[var(--text-main)]">Something went wrong</h2>
                <p className="text-[var(--text-secondary)] text-sm break-words font-mono bg-[var(--glass-highlight)] p-3 rounded-lg border border-[var(--glass-border)]">
                    {err.message || 'Unknown error occurred'}
                </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
                <button
                    onClick={resetErrorBoundary}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>

                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] text-[var(--text-main)] border border-[var(--glass-border)] rounded-xl font-medium transition-all"
                >
                    <Home className="w-4 h-4" />
                    Back Home
                </button>
            </div>
        </div>
    );
};
