import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Phone, QrCode, Cookie } from 'lucide-react';
import { PlatformBadge } from '../common/badges/PlatformBadge';
import { getPlatformI18nKey } from '../../lib/platformUtils';
import type { Platform } from '../../types';

// Sub-components
import PhoneLoginForm from './PhoneLoginForm';
import CookieLoginForm from './CookieLoginForm';
import QQCookieLoginForm from './QQCookieLoginForm';
import QrLoginPanel from './QrLoginPanel';
import AuthStatusScreen from './AuthStatusScreen';
import { PLATFORM_COLORS } from './authTypes';
import type { LoginMode } from './authTypes';

// Business logic
import { useAuthLogic } from '../../hooks/useAuthLogic';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: Platform | null;
    onConnect: (platformName: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, platform, onConnect }) => {
    const { t } = useTranslation();

    const auth = useAuthLogic({ isOpen, platform, onConnect, onClose });

    if (!isOpen || !platform) return null;

    const accentColor = PLATFORM_COLORS[platform.name] || '#fff';
    const platformNameTranslated = t(`platforms.${getPlatformI18nKey(platform.name)}`);

    // Determine which body content to show
    const isFormStep = (auth.step === 'phone' || auth.step === 'qrcode' || auth.step === 'cookie') && !auth.loading;
    const isStatusStep = !isFormStep;

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
                                {auth.loginMode === 'phone' ? (
                                    <Phone className="w-3 h-3 text-black" />
                                ) : auth.loginMode === 'cookie' ? (
                                    <Cookie className="w-3 h-3 text-black" />
                                ) : (
                                    <QrCode className="w-3 h-3 text-black" />
                                )}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-main)]">{t('auth.connect', { platform: platformNameTranslated })}</h2>
                    </div>
                </div>

                {/* Login Mode Tabs (only for NetEase) */}
                {auth.isNetease && isFormStep && (
                    <div className="flex mx-8 mt-4 p-1 bg-[var(--glass-highlight)] rounded-lg">
                        {([
                            { mode: 'phone' as LoginMode, icon: Phone, labelKey: 'auth.phone.title' },
                            { mode: 'qr' as LoginMode, icon: QrCode, labelKey: 'auth.qr.title' },
                            { mode: 'cookie' as LoginMode, icon: Cookie, labelKey: 'auth.cookie.title' },
                        ]).map(({ mode, icon: Icon, labelKey }) => (
                            <button
                                key={mode}
                                onClick={() => auth.switchLoginMode(mode)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all ${auth.loginMode === mode
                                    ? 'bg-[var(--accent-color)] text-white shadow-sm'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {t(labelKey)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div className="p-8">
                    {auth.step === 'phone' && !auth.loading && (
                        <PhoneLoginForm
                            accentColor={accentColor}
                            phoneError={auth.phoneError}
                            loading={auth.loading}
                            phoneNumber={auth.phoneNumber}
                            captchaCode={auth.captchaCode}
                            captchaCooldown={auth.captchaCooldown}
                            onPhoneChange={(v) => { auth.setPhoneNumber(v); auth.setPhoneError(''); }}
                            onCaptchaChange={(v) => { auth.setCaptchaCode(v); auth.setPhoneError(''); }}
                            onSendCaptcha={auth.handleSendCaptcha}
                            onLogin={auth.handlePhoneLogin}
                        />
                    )}

                    {auth.step === 'cookie' && !auth.loading && (
                        auth.isQQ ? (
                            <QQCookieLoginForm
                                accentColor={accentColor}
                                phoneError={auth.phoneError}
                                loading={auth.loading}
                                cookieInput={auth.cookieInput}
                                onCookieChange={auth.setCookieInput}
                                onLogin={auth.handleQQCookieLogin}
                            />
                        ) : (
                            <CookieLoginForm
                                accentColor={accentColor}
                                phoneError={auth.phoneError}
                                loading={auth.loading}
                                cookieInput={auth.cookieInput}
                                onCookieChange={auth.setCookieInput}
                                onLogin={auth.handleCookieLogin}
                            />
                        )
                    )}

                    {auth.step === 'qrcode' && !auth.loading && (
                        <QrLoginPanel
                            qrUrl={auth.qrUrl}
                            isNetease={auth.isNetease}
                            platformNameTranslated={platformNameTranslated}
                            onSimulateLogin={auth.handleSimulateLogin}
                        />
                    )}

                    {isStatusStep && (
                        <AuthStatusScreen
                            step={auth.step}
                            accentColor={accentColor}
                            verifyUrl={auth.verifyUrl}
                            onRetry={auth.handleRefreshQr}
                            onPhoneLogin={auth.handlePhoneLogin}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[var(--glass-highlight)] border-t border-[var(--glass-border)] flex justify-between items-center text-xs text-[var(--text-secondary)]">
                    <span>{t('auth.privacy')}</span>
                    {!auth.isNetease && (
                        <span className="hover:text-[var(--text-main)] cursor-pointer">{t('auth.passwordLogin')}</span>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AuthModal;
