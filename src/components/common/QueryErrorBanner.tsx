import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QueryErrorBannerProps {
    /** Error message to display */
    message?: string;
    /** Callback to retry the failed query */
    onRetry?: () => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Inline error banner for API query failures.
 * Renders a compact, themed banner with error details and a retry button.
 */
const QueryErrorBanner: React.FC<QueryErrorBannerProps> = ({
    message,
    onRetry,
    className = '',
}) => {
    const { t } = useTranslation();

    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm ${className}`}
        >
            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-main)]">
                    {t('common.error.loadFailed')}
                </p>
                {message && (
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {message}
                    </p>
                )}
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all flex-shrink-0"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t('common.error.retryButton')}
                </button>
            )}
        </div>
    );
};

export default QueryErrorBanner;
