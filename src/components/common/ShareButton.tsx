import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ShareButtonProps {
    className?: string;
    text?: string;
    onShare?: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ className = '', text, onShare }) => {
    const { t } = useTranslation();
    const [isShared, setIsShared] = useState(false);

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        if (onShare) onShare();

        // Reset after 3 seconds
        setTimeout(() => setIsShared(false), 3000);
    };

    return (
        <button
            onClick={handleShare}
            className={`px-5 py-3 border rounded-full transition-all flex items-center gap-3 ${isShared
                ? 'bg-green-500 text-white border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                : 'bg-[var(--glass-highlight)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--glass-border)] hover:text-[var(--text-main)] hover:scale-105'
                } ${className}`}
        >
            {isShared ? (
                <>
                    <Check className="w-5 h-5 animate-[modal-content-in_0.3s_ease-out]" />
                    <span className="text-sm font-bold animate-[content-slide-up_0.3s_ease-out]">{t('playlist.linkCopied')}</span>
                </>
            ) : (
                <>
                    <Share2 className="w-5 h-5" />
                    {text && <span className="text-sm font-medium">{text}</span>}
                </>
            )}
        </button>
    );
};

export default ShareButton;
