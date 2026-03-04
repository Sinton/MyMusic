import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Phone, QrCode, Cookie } from 'lucide-react';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import { PlatformBadge } from './common/badges/PlatformBadge';
import { NeteaseService } from '../services/NeteaseService';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { getPlatformI18nKey } from '../lib/platformUtils';
import type { Platform } from '../types';

// Sub-components
import PhoneLoginForm from './auth/PhoneLoginForm';
import CookieLoginForm from './auth/CookieLoginForm';
import QQCookieLoginForm from './auth/QQCookieLoginForm';
import QrLoginPanel from './auth/QrLoginPanel';
import AuthStatusScreen from './auth/AuthStatusScreen';
import { PLATFORM_COLORS } from './auth/authTypes';
import type { AuthStep, LoginMode } from './auth/authTypes';
import { QQMusicService } from '../services/QQMusicService';
import { useQQStore } from '../stores/useQQStore';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: Platform | null;
    onConnect: (platformName: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, platform, onConnect }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState<AuthStep>('qrcode');
    const [loading, setLoading] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [loginMode, setLoginMode] = useState<LoginMode>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [captchaCode, setCaptchaCode] = useState('');
    const [captchaCooldown, setCaptchaCooldown] = useState(0);
    const [phoneError, setPhoneError] = useState('');
    const [verifyUrl, setVerifyUrl] = useState('');
    const [cookieInput, setCookieInput] = useState('');
    const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const isNetease = platform?.name?.includes('NetEase') ?? false;
    const isQQ = platform?.name?.includes('QQ') ?? false;
    const neteaseStore = useNeteaseStore();
    const qqStore = useQQStore();

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (pollTimer.current) clearInterval(pollTimer.current);
            if (cooldownTimer.current) clearInterval(cooldownTimer.current);
        };
    }, []);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(loginMode === 'phone' ? 'phone' : 'qrcode');
            setLoading(false);
            setQrUrl('');
            setPhoneNumber('');
            setCaptchaCode('');
            setPhoneError('');
            setCaptchaCooldown(0);
            if (pollTimer.current) clearInterval(pollTimer.current);
            if (cooldownTimer.current) clearInterval(cooldownTimer.current);

            if (isNetease && loginMode === 'qr') {
                initQrLogin();
            } else if (isQQ) {
                setStep('cookie');
                setLoginMode('cookie');
            }
        } else {
            if (pollTimer.current) clearInterval(pollTimer.current);
            if (cooldownTimer.current) clearInterval(cooldownTimer.current);
        }
    }, [isOpen, platform]);

    /** Initialize QR login: generate key + QR URL + start polling */
    const initQrLogin = useCallback(async () => {
        if (!isNetease) return;
        setLoading(true);
        try {
            const keyData: any = await NeteaseService.getQrKey();
            const unikey = keyData?.unikey || keyData?.data?.unikey;
            if (!unikey) {
                console.error('Failed to get QR key:', keyData);
                setStep('error');
                setLoading(false);
                return;
            }
            neteaseStore.setQrKey(unikey);

            const qrLoginUrl = `https://music.163.com/login?codekey=${unikey}`;
            setQrUrl(qrLoginUrl);
            neteaseStore.setQrUrl(qrLoginUrl);
            setLoading(false);

            startPolling(unikey);
        } catch (err) {
            console.error('QR login init failed:', err);
            setStep('error');
            setLoading(false);
        }
    }, [isNetease]);

    /** Poll QR scan status every 3 seconds */
    const startPolling = (key: string) => {
        if (pollTimer.current) clearInterval(pollTimer.current);

        let scannedUser: { nickname?: string; avatarUrl?: string } = {};

        pollTimer.current = setInterval(async () => {
            try {
                const result: any = await NeteaseService.checkQrLogin(key);
                const code = result?.code;

                if (code === 802) {
                    neteaseStore.setQrStatus('scanned');
                    setStep('scanning');
                    if (result?.nickname) scannedUser.nickname = result.nickname;
                    if (result?.avatarUrl) scannedUser.avatarUrl = result.avatarUrl;
                } else if (code === 803) {
                    if (pollTimer.current) clearInterval(pollTimer.current);
                    neteaseStore.setQrStatus('confirmed');
                    setStep('success');

                    const responseCookie = result?.cookie || '';
                    if (responseCookie) {
                        neteaseStore.setCookie(responseCookie);
                    }

                    try {
                        const cookie = responseCookie || neteaseStore.cookie;
                        if (cookie) {
                            const statusData = await NeteaseService.getLoginStatus(cookie);
                            const profile = statusData?.data?.profile || statusData?.profile;
                            if (profile) {
                                neteaseStore.setUser({
                                    userId: profile.userId,
                                    nickname: profile.nickname,
                                    avatarUrl: profile.avatarUrl,
                                    vipType: profile.vipType || 0,
                                });
                            } else if (scannedUser.nickname) {
                                neteaseStore.setUser({
                                    userId: 0,
                                    nickname: scannedUser.nickname,
                                    avatarUrl: scannedUser.avatarUrl || '',
                                    vipType: 0,
                                });
                            }
                        }
                    } catch (profileErr) {
                        console.warn('Failed to fetch profile after QR login:', profileErr);
                        if (scannedUser.nickname) {
                            neteaseStore.setUser({
                                userId: 0,
                                nickname: scannedUser.nickname,
                                avatarUrl: scannedUser.avatarUrl || '',
                                vipType: 0,
                            });
                        }
                    }

                    neteaseStore.setLoggedIn(true);
                    setTimeout(() => {
                        onConnect(platform!.name);
                        onClose();
                    }, 1500);
                } else if (code === 800) {
                    if (pollTimer.current) clearInterval(pollTimer.current);
                    neteaseStore.setQrStatus('expired');
                    setStep('expired');
                }
            } catch (err) {
                console.error('QR poll error:', err);
            }
        }, 3000);
    };

    /** Handle simulated login for non-NetEase platforms */
    const handleSimulateLogin = () => {
        setLoading(true);
        setTimeout(() => {
            setStep('success');
            setLoading(false);
            setTimeout(() => {
                onConnect(platform!.name);
                onClose();
            }, 1500);
        }, 2000);
    };

    /** Refresh expired QR code */
    const handleRefreshQr = () => {
        setStep('qrcode');
        initQrLogin();
    };

    /** Switch login mode */
    const switchLoginMode = (mode: LoginMode) => {
        if (pollTimer.current) clearInterval(pollTimer.current);
        setLoginMode(mode);
        setPhoneError('');

        if (mode === 'qr') {
            setStep('qrcode');
            initQrLogin();
        } else if (mode === 'phone') {
            setStep('phone');
        } else {
            setStep('cookie');
        }
    };

    /** Login with pasted cookie */
    const handleCookieLogin = async () => {
        const trimmed = cookieInput.trim();
        if (!trimmed) {
            setPhoneError(t('auth.error.pasteValidCookie'));
            return;
        }
        setPhoneError('');
        setLoading(true);
        try {
            neteaseStore.setCookie(trimmed);
            const statusData = await NeteaseService.getLoginStatus(trimmed);
            const profile = statusData?.data?.profile || statusData?.profile;
            if (profile) {
                neteaseStore.setUser({
                    userId: profile.userId,
                    nickname: profile.nickname,
                    avatarUrl: profile.avatarUrl,
                    vipType: profile.vipType || 0,
                });
                neteaseStore.setLoggedIn(true);
                setStep('success');
                setTimeout(() => {
                    onConnect(platform!.name);
                    onClose();
                }, 1500);
            } else {
                setPhoneError(t('auth.error.invalidCookie'));
            }
        } catch (err) {
            console.error('Cookie login failed:', err);
            setPhoneError(t('auth.error.verificationFailed'));
        } finally {
            setLoading(false);
        }
    };

    /** Login with pasted cookie for QQ Music */
    const handleQQCookieLogin = async () => {
        const trimmed = cookieInput.trim();
        if (!trimmed) {
            setPhoneError(t('auth.error.pasteValidCookie'));
            return;
        }
        setPhoneError('');
        setLoading(true);
        try {
            qqStore.setCookie(trimmed);
            const user = await QQMusicService.getLoginStatus(trimmed);

            if (user) {
                qqStore.setUser(user);
                qqStore.setLoggedIn(true);
                setStep('success');
                setTimeout(() => {
                    onConnect(platform!.name);
                    onClose();
                }, 1500);
            } else {
                setPhoneError(t('auth.error.invalidCookie'));
            }
        } catch (err) {
            console.error('QQ Cookie login failed:', err);
            setPhoneError(t('auth.error.verificationFailed'));
        } finally {
            setLoading(false);
        }
    };

    /** Send SMS captcha */
    const handleSendCaptcha = async () => {
        if (!phoneNumber || phoneNumber.length < 11) {
            setPhoneError(t('auth.error.invalidPhone'));
            return;
        }
        setPhoneError('');
        setLoading(true);
        try {
            const result = await NeteaseService.sendCaptcha(phoneNumber);
            console.log('[Captcha] send result:', result);
            if (result?.code === 200) {
                setCaptchaCooldown(60);
                cooldownTimer.current = setInterval(() => {
                    setCaptchaCooldown(prev => {
                        if (prev <= 1) {
                            if (cooldownTimer.current) clearInterval(cooldownTimer.current);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else if (result?.code === -462) {
                const vUrl = result?.data?.url || '';
                if (vUrl) {
                    setVerifyUrl(vUrl);
                    setStep('verify');
                    try { await shellOpen(vUrl); } catch (e) { console.warn('Failed to open verify URL:', e); }
                } else {
                    setPhoneError(t('auth.error.verifyNeeded'));
                }
            } else {
                setPhoneError(result?.message || t('auth.error.captchaSendFailed'));
            }
        } catch (err: any) {
            console.error('Send captcha failed:', err);
            setPhoneError(t('auth.error.captchaRetry'));
        } finally {
            setLoading(false);
        }
    };

    /** Login with phone + captcha */
    const handlePhoneLogin = async () => {
        if (!phoneNumber || !captchaCode) {
            setPhoneError(t('auth.error.phoneCaptchaRequired'));
            return;
        }
        setPhoneError('');
        setLoading(true);
        try {
            const { data, cookie } = await NeteaseService.loginCellphone(phoneNumber, captchaCode);
            console.log('[PhoneLogin] data:', data, 'cookie:', cookie ? 'present' : 'missing');

            if (data?.code === 200) {
                setStep('success');
                if (cookie) {
                    neteaseStore.setCookie(cookie);
                }

                const profile = data?.profile;
                const account = data?.account;
                if (profile) {
                    neteaseStore.setUser({
                        userId: profile.userId || 0,
                        nickname: profile.nickname || '',
                        avatarUrl: profile.avatarUrl || '',
                        vipType: profile.vipType || 0,
                    });
                } else if (account) {
                    neteaseStore.setUser({
                        userId: account.id || 0,
                        nickname: account.userName || '',
                        avatarUrl: '',
                        vipType: 0,
                    });
                }

                neteaseStore.setLoggedIn(true);
                setTimeout(() => {
                    onConnect(platform!.name);
                    onClose();
                }, 1500);
            } else if (data?.code === -462) {
                const vUrl = data?.data?.url || '';
                if (vUrl) {
                    setVerifyUrl(vUrl);
                    setStep('verify');
                    try {
                        await shellOpen(vUrl);
                    } catch (e) {
                        console.warn('Failed to open verify URL:', e);
                    }
                } else {
                    setPhoneError(t('auth.error.verifyNeeded'));
                }
            } else {
                setPhoneError(data?.message || data?.msg || t('auth.error.loginFailed'));
            }
        } catch (err: any) {
            console.error('Phone login failed:', err);
            setPhoneError(t('auth.error.loginRetry'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !platform) return null;

    const accentColor = PLATFORM_COLORS[platform.name] || '#fff';
    const platformNameTranslated = t(`platforms.${getPlatformI18nKey(platform.name)}`);

    // Determine which body content to show
    const isFormStep = (step === 'phone' || step === 'qrcode' || step === 'cookie') && !loading;
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

                {/* Login Mode Tabs (only for NetEase) */}
                {isNetease && isFormStep && (
                    <div className="flex mx-8 mt-4 p-1 bg-[var(--glass-highlight)] rounded-lg">
                        {([
                            { mode: 'phone' as LoginMode, icon: Phone, labelKey: 'auth.phone.title' },
                            { mode: 'qr' as LoginMode, icon: QrCode, labelKey: 'auth.qr.title' },
                            { mode: 'cookie' as LoginMode, icon: Cookie, labelKey: 'auth.cookie.title' },
                        ]).map(({ mode, icon: Icon, labelKey }) => (
                            <button
                                key={mode}
                                onClick={() => switchLoginMode(mode)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all ${loginMode === mode
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
                    {step === 'phone' && !loading && (
                        <PhoneLoginForm
                            accentColor={accentColor}
                            phoneError={phoneError}
                            loading={loading}
                            phoneNumber={phoneNumber}
                            captchaCode={captchaCode}
                            captchaCooldown={captchaCooldown}
                            onPhoneChange={(v) => { setPhoneNumber(v); setPhoneError(''); }}
                            onCaptchaChange={(v) => { setCaptchaCode(v); setPhoneError(''); }}
                            onSendCaptcha={handleSendCaptcha}
                            onLogin={handlePhoneLogin}
                        />
                    )}

                    {step === 'cookie' && !loading && (
                        isQQ ? (
                            <QQCookieLoginForm
                                accentColor={accentColor}
                                phoneError={phoneError}
                                loading={loading}
                                cookieInput={cookieInput}
                                onCookieChange={setCookieInput}
                                onLogin={handleQQCookieLogin}
                            />
                        ) : (
                            <CookieLoginForm
                                accentColor={accentColor}
                                phoneError={phoneError}
                                loading={loading}
                                cookieInput={cookieInput}
                                onCookieChange={setCookieInput}
                                onLogin={handleCookieLogin}
                            />
                        )
                    )}

                    {step === 'qrcode' && !loading && (
                        <QrLoginPanel
                            qrUrl={qrUrl}
                            isNetease={isNetease}
                            platformNameTranslated={platformNameTranslated}
                            onSimulateLogin={handleSimulateLogin}
                        />
                    )}

                    {isStatusStep && (
                        <AuthStatusScreen
                            step={step}
                            accentColor={accentColor}
                            verifyUrl={verifyUrl}
                            onRetry={handleRefreshQr}
                            onPhoneLogin={handlePhoneLogin}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[var(--glass-highlight)] border-t border-[var(--glass-border)] flex justify-between items-center text-xs text-[var(--text-secondary)]">
                    <span>{t('auth.privacy')}</span>
                    {!isNetease && (
                        <span className="hover:text-[var(--text-main)] cursor-pointer">{t('auth.passwordLogin')}</span>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AuthModal;
