import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Phone, QrCode, Cookie } from 'lucide-react';
import { PlatformBadge } from '../common/badges/PlatformBadge';
import { getPlatformI18nKey } from '../../lib/platformUtils';
import type { Platform } from '../../types';
import type { LoginMode } from './authTypes';
import { PLATFORM_COLORS } from './authTypes';

interface AuthModalShellProps {
    isOpen: boolean;
    onClose: () => void;
    platform: Platform | null;
    loginMode: LoginMode;
    isNetease: boolean;
    headerExtra?: React.ReactNode;
    footerExtra?: React.ReactNode;
    children: React.ReactNode;
}

export const AuthModalShell: React.FC<AuthModalShellProps> = ({
    isOpen,
    onClose,
    platform,
    loginMode,
    isNetease,
    headerExtra,
    footerExtra,
    children
}) => {
    const { t } = useTranslation();

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
            <div className="relative w-full max-w-sm glass-drawer border border-[var(--glass-border)] rounded-[2.5rem] shadow-2xl overflow-hidden animate-modal-content">

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
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                                {loginMode === 'phone' ? (
                                    <Phone className="w-3 h-3 text-black" />
                                ) : loginMode === 'cookie' ? (
                                    <Cookie className="w-3 h-3 text-black" />
                                ) : (
                                    <QrCode className="w-3 h-3 text-black" />
                                )}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-main)]">{t('auth.connect', { platform: platformNameTranslated })}</h2>
                    </div>
                </div>

                {/* Optional Header Extra (like Tabs) */}
                {headerExtra}

                {/* Body */}
                <div className="p-8">
                    {children}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[var(--glass-highlight)] border-t border-[var(--glass-border)] flex justify-between items-center text-xs text-[var(--text-secondary)]">
                    <span>{t('auth.privacy')}</span>
                    {footerExtra || (
                        !isNetease && (
                            <span className="hover:text-[var(--text-main)] cursor-pointer">{t('auth.passwordLogin')}</span>
                        )
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
