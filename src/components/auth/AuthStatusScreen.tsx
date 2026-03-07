import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Smartphone, Loader2, CheckCircle,
    AlertTriangle, ShieldCheck, RefreshCw,
    Construction, LogOut
} from 'lucide-react';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import type { AuthStep } from './authTypes';

interface AuthStatusScreenProps {
    step: AuthStep;
    accentColor: string;
    verifyUrl: string;
    scannedUser?: { nickname: string; avatarUrl: string } | null;
    onRetry: () => void;
    onPhoneLogin: () => void;
    onLogout?: () => void; // New prop
    onClose?: () => void;
}

const AuthStatusScreen: React.FC<AuthStatusScreenProps> = ({
    step,
    accentColor,
    verifyUrl,
    scannedUser,
    onRetry,
    onPhoneLogin,
    onLogout,
    onClose,
}) => {
    const { t } = useTranslation();

    if (step === 'logged_in') {
        return (
            <div className="py-8 flex flex-col items-center justify-center space-y-6 animate-fade-in text-center w-full">
                <div className="relative group">
                    <div className="absolute inset-0 bg-[var(--accent-color)] opacity-20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <div
                        className="relative p-1 rounded-full bg-white/20 dark:bg-white/5 border border-white/30 backdrop-blur-2xl shadow-2xl z-10"
                        style={{ WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}
                    >
                        <img
                            src={scannedUser?.avatarUrl || ''}
                            alt={scannedUser?.nickname}
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center z-20 shadow-lg">
                        <CheckCircle className="w-4.5 h-4.5 text-white" />
                    </div>
                </div>

                <div className="space-y-1 z-10">
                    <h3 className="text-xl font-bold text-[var(--text-main)]">
                        {scannedUser?.nickname}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                        {t('auth.alreadyLoggedIn', '当前已登录该账号')}
                    </p>
                </div>

                <div className="flex flex-row gap-3 w-full px-8 pt-2">
                    <button
                        onClick={onLogout}
                        className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all font-bold group text-sm"
                    >
                        <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        {t('auth.logout', '退出登录')}
                    </button>

                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] text-[var(--text-secondary)] transition-all text-sm font-bold"
                    >
                        {t('common.cancel', '取消')}
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'scanning') {
        return (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in text-center">
                <div className="relative">
                    {scannedUser?.avatarUrl ? (
                        <div className="relative">
                            <div
                                className="relative p-1 rounded-full bg-white/20 dark:bg-white/5 border border-white/30 backdrop-blur-2xl shadow-xl z-10 animate-in zoom-in-50 duration-500"
                                style={{ WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}
                            >
                                <img
                                    src={scannedUser.avatarUrl}
                                    alt={scannedUser.nickname}
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--accent-color)] rounded-full flex items-center justify-center shadow-md animate-bounce">
                                <Smartphone className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Smartphone className="w-8 h-8 text-blue-400 animate-bounce" />
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[var(--text-main)]">
                        {scannedUser?.nickname ? scannedUser.nickname : t('auth.scanned', '已扫描')}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                        {t('auth.confirmOnPhone', '请在手机上确认登录')}
                    </p>
                </div>
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
                <h3 className="text-lg font-bold text-[var(--text-main)]">{t('auth.error.title')}</h3>
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
