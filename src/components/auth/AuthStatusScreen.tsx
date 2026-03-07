import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Smartphone, Loader2, CheckCircle,
    AlertTriangle, ShieldCheck, RefreshCw,
    Construction
} from 'lucide-react';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import type { AuthStep } from './authTypes';

interface AuthStatusScreenProps {
    step: AuthStep;
    accentColor: string;
    verifyUrl: string;
    onRetry: () => void;
    onPhoneLogin: () => void;
    onClose?: () => void;
}

const AuthStatusScreen: React.FC<AuthStatusScreenProps> = ({
    step,
    accentColor,
    verifyUrl,
    onRetry,
    onPhoneLogin,
    onClose,
}) => {
    const { t } = useTranslation();

    if (step === 'scanning') {
        return (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-blue-400 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">{t('auth.scanned', '已扫描')}</h3>
                <p className="text-sm text-[var(--text-secondary)] text-center">
                    {t('auth.confirmOnPhone', '请在手机上确认登录')}
                </p>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">{t('auth.success')}</h3>
                <p className="text-sm text-[var(--text-secondary)] text-center">
                    {t('auth.syncing')}
                </p>
            </div>
        );
    }

    if (step === 'verify') {
        return (
            <div className="py-6 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">{t('auth.error.verifyRequired')}</h3>
                <p className="text-sm text-[var(--text-secondary)] text-center px-4">
                    {t('auth.error.verifyOpenBrowser')}
                </p>
                <div className="flex flex-col gap-2 w-full">
                    <button
                        onClick={onPhoneLogin}
                        className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                        style={{ background: accentColor }}
                    >
                        {t('auth.error.verifyComplete')}
                    </button>
                    {verifyUrl && (
                        <button
                            onClick={() => shellOpen(verifyUrl)}
                            className="w-full py-2.5 rounded-xl font-bold text-sm transition-all bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] text-[var(--text-secondary)]"
                        >
                            {t('auth.error.verifyReopen')}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (step === 'expired') {
        return (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">{t('auth.expired', '二维码已过期')}</h3>
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-sm text-[var(--text-main)]"
                >
                    <RefreshCw className="w-4 h-4" />
                    {t('auth.refresh', '刷新二维码')}
                </button>
            </div>
        );
    }

    if (step === 'coming_soon') {
        const platformNameRaw = accentColor === '#ffde00' ? 'Qishui' : 'This platform';
        const platformNameTranslated = t(`platforms.${platformNameRaw.toLowerCase()}`, platformNameRaw);

        return (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Construction className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-main)]">{t('auth.error.comingSoon.title')}</h3>
                <p className="text-sm text-[var(--text-secondary)] px-6">
                    {t('auth.error.comingSoon.desc', { platform: platformNameTranslated })}
                </p>
                <div className="pt-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-all text-sm font-bold text-[var(--text-main)]"
                    >
                        {t('common.confirm')}
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'error') {
        return (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">{t('auth.error', '连接失败')}</h3>
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-sm text-[var(--text-main)]"
                >
                    <RefreshCw className="w-4 h-4" />
                    {t('auth.retry', '重试')}
                </button>
            </div>
        );
    }

    // Loading fallback
    return (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-[var(--text-main)] animate-spin" />
            <p className="text-sm text-[var(--text-secondary)]">{t('auth.authorizing')}</p>
        </div>
    );
};

export default AuthStatusScreen;
