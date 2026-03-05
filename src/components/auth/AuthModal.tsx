import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, QrCode, Cookie } from 'lucide-react';
import { getPlatformI18nKey } from '../../lib/platformUtils';
import type { Platform } from '../../types';

// Sub-components
import PhoneLoginForm from './PhoneLoginForm';
import CookieLoginForm from './CookieLoginForm';
import QQCookieLoginForm from './QQCookieLoginForm';
import QrLoginPanel from './QrLoginPanel';
import AuthStatusScreen from './AuthStatusScreen';
import { AuthModalShell } from './AuthModalShell';
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

    const isFormStep = (auth.step === 'phone' || auth.step === 'qrcode' || auth.step === 'cookie') && !auth.loading;
    const isStatusStep = !isFormStep;

    const headerExtra = auth.isNetease && isFormStep ? (
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
    ) : null;

    return (
        <AuthModalShell
            isOpen={isOpen}
            onClose={onClose}
            platform={platform}
            loginMode={auth.loginMode}
            isNetease={auth.isNetease}
            headerExtra={headerExtra}
        >
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
        </AuthModalShell>
    );
};

export default AuthModal;
