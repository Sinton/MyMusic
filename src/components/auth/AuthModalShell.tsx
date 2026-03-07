import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { PlatformBadge } from '../common/badges/PlatformBadge';
import { getPlatformI18nKey } from '../../lib/platformUtils';
import type { Platform } from '../../types';
import { PLATFORM_COLORS } from './authTypes';

interface AuthModalShellProps {
    isOpen: boolean;
    onClose: () => void;
    platform: Platform | null;
    headerExtra?: React.ReactNode;
    footerExtra?: React.ReactNode;
    children: React.ReactNode;
}

export const AuthModalShell: React.FC<AuthModalShellProps> = ({
    isOpen,
    onClose,
    platform,
    headerExtra,
    footerExtra,
    children
}) => {
    const { t } = useTranslation();
    const [height, setHeight] = React.useState<number | 'auto'>('auto');
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Smoothly animate the height of the modal body when content changes
    React.useLayoutEffect(() => {
        if (isOpen && contentRef.current) {
            const observer = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    // entry.target.scrollHeight provides the actual height of the inner content
                    setHeight(entry.target.scrollHeight);
                }
            });

            observer.observe(contentRef.current);
            return () => observer.disconnect();
        } else if (!isOpen) {
            setHeight('auto');
        }
    }, [isOpen, children]); // Re-observe if children change

    if (!isOpen || !platform) return null;

    const accentColor = PLATFORM_COLORS[platform.name] || '#fff';
    const platformNameTranslated = t(`platforms.${getPlatformI18nKey(platform.name)}`);

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 antialiased overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 animate-modal-backdrop backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm glass-drawer border border-[var(--glass-border)] rounded-[1.5rem] shadow-2xl overflow-hidden animate-modal-content">

                {/* Header */}
                <div className="relative h-32 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${accentColor}40, transparent)` }}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--glass-highlight)] transition-colors text-white/70 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <div className="relative">
                            <PlatformBadge
                                name={platform.name}
                                color={accentColor}
                                size="lg"
                                className="!w-16 !h-16 !rounded-xl mx-auto mb-3 shadow-lg"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-main)]">{t('auth.connect', { platform: platformNameTranslated })}</h2>
                    </div>
                </div>

                {/* Optional Header Extra (like Tabs) */}
                {headerExtra}

                {/* Body - Animated height container */}
                <div
                    className="overflow-hidden transition-[height] duration-300 ease-out"
                    style={{ height }}
                >
                    <div ref={contentRef} className="p-8">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[var(--glass-highlight)] border-t border-[var(--glass-border)] flex justify-between items-center text-xs text-[var(--text-secondary)]">
                    <span>{t('auth.privacy')}</span>
                    {footerExtra || null}
                </div>
            </div>
        </div>,
        document.body
    );
};
