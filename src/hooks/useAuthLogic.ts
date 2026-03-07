import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import { NeteaseService } from '../services/NeteaseService';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { QQService } from '../services/QQService';
import { useQQStore } from '../stores/useQQStore';
import type { Platform } from '../types';
import type { AuthStep, LoginMode } from '../components/auth/authTypes';

interface UseAuthLogicOptions {
    isOpen: boolean;
    platform: Platform | null;
    onConnect: (platformName: string) => void;
    onClose: () => void;
}

export function useAuthLogic({ isOpen, platform, onConnect, onClose }: UseAuthLogicOptions) {
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
    const isQishui = platform?.name?.includes('Qishui') ?? false;
    const neteaseStore = useNeteaseStore();
    const qqStore = useQQStore();

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (pollTimer.current) clearInterval(pollTimer.current);
            if (cooldownTimer.current) clearInterval(cooldownTimer.current);
        };
    }, []);

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

    const lastPlatformRef = useRef<string | null>(null);

    // Reset state when modal opens or platform changes
    useEffect(() => {
        if (isOpen && platform) {
            const isNewPlatform = lastPlatformRef.current !== platform.name;

            // If switching platforms, reset mode to default (qr)
            let currentMode = loginMode;
            if (isNewPlatform) {
                currentMode = 'qr';
                setLoginMode('qr');
                lastPlatformRef.current = platform.name;
            }

            setStep(currentMode === 'phone' ? 'phone' : 'qrcode');
            setLoading(false);
            setQrUrl('');
            setPhoneNumber('');
            setCaptchaCode('');
            setPhoneError('');
            setCaptchaCooldown(0);
            if (pollTimer.current) clearInterval(pollTimer.current);
            if (cooldownTimer.current) clearInterval(cooldownTimer.current);

            // Platform specific initialization
            if (isNetease && currentMode === 'qr') {
                initQrLogin();
            } else if (isQQ && currentMode === 'cookie') {
                setStep('cookie');
            } else if (isQQ && currentMode !== 'cookie') {
                // For QQ, if not in developer/cookie mode, default to QR (simulated)
                setStep('qrcode');
                setLoginMode('qr');
            } else if (isQishui) {
                setStep('coming_soon');
            }
        } else if (!isOpen) {
            if (pollTimer.current) clearInterval(pollTimer.current);
            if (cooldownTimer.current) clearInterval(cooldownTimer.current);
            // Optionally clear lastPlatformRef on close if you want it to reset even on the same platform
            // lastPlatformRef.current = null;
        }
    }, [isOpen, platform, isNetease, isQQ, isQishui, initQrLogin]);

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
            const user = await QQService.getLoginStatus(trimmed);

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

    return {
        // State
        step,
        loading,
        qrUrl,
        loginMode,
        phoneNumber,
        captchaCode,
        captchaCooldown,
        phoneError,
        verifyUrl,
        cookieInput,
        isNetease,
        isQQ,
        isQishui,

        // Setters
        setPhoneNumber,
        setCaptchaCode,
        setPhoneError,
        setCookieInput,

        // Actions
        switchLoginMode,
        handleSimulateLogin,
        handleRefreshQr,
        handleCookieLogin,
        handleQQCookieLogin,
        handleSendCaptcha,
        handlePhoneLogin,
    };
}
