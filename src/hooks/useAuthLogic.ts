import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import { NeteaseService } from '../services/NeteaseService';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { QQService } from '../services/QQService';
import { useQQStore } from '../stores/useQQStore';
import { usePlatformStore } from '../stores/usePlatformStore';
import type { Platform } from '../types';
import type { AuthStep, LoginMode } from '../components/auth/authTypes';
import { AuthService } from '../services/AuthService';
import type { MusicAuthResponse } from '../types/api/models';

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
    const [qrData, setQrData] = useState(''); // New: Base64 QR image
    const [loginMode, setLoginMode] = useState<LoginMode>('qr');
    const lastLoginModeRef = useRef<LoginMode>('qr'); // 记录用户最后选择的登录方式
    const [phoneNumber, setPhoneNumber] = useState('');
    const [captchaCode, setCaptchaCode] = useState('');
    const [captchaCooldown, setCaptchaCooldown] = useState(0);
    const [phoneError, setPhoneError] = useState('');
    const [verifyUrl, setVerifyUrl] = useState('');
    const [cookieInput, setCookieInput] = useState('');
    const [scannedUser, setScannedUser] = useState<{ nickname: string; avatarUrl: string } | null>(null);
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

    /** Poll QR scan status every 2 seconds */
    const startPolling = (authId: string) => {
        if (pollTimer.current) clearInterval(pollTimer.current);

        const provider = isNetease ? 'netease' : (isQQ ? 'qq' : '');
        if (!provider) return;

        pollTimer.current = setInterval(async () => {
            try {
                const result: MusicAuthResponse = await AuthService.checkQr(provider, authId);
                const status = result.status;

                console.log(`[QR Poll][${provider}] Status:`, status);

                if (status === 'scanned') {
                    if (isNetease) neteaseStore.setQrStatus('scanned');
                    else if (isQQ) qqStore.setQrStatus('scanned');
                    setStep('scanning');

                    const nickname = result.nickname || '';
                    const avatar = result.avatar || '';

                    setScannedUser({
                        nickname: nickname,
                        avatarUrl: avatar
                    });
                } else if (status === 'success') {
                    if (pollTimer.current) clearInterval(pollTimer.current);

                    // Successfully Logged In
                    if (isNetease) {
                        neteaseStore.setQrStatus('confirmed');
                        neteaseStore.setLoggedIn(true);
                        if (result.cookie) neteaseStore.setCookie(result.cookie);

                        // Background: Sync profile
                        const finalNickname = result.nickname || '';
                        const finalAvatar = result.avatar || '';

                        neteaseStore.setUser({
                            userId: 0,
                            nickname: finalNickname,
                            avatarUrl: finalAvatar,
                            vipType: 0,
                        });

                        // Optionally refresh real profile
                        setTimeout(async () => {
                            try {
                                const statusData = await NeteaseService.getLoginStatus(result.cookie || '');
                                const profile = statusData?.data?.profile || statusData?.profile;
                                if (profile) {
                                    neteaseStore.setUser({
                                        userId: profile.userId,
                                        nickname: profile.nickname || finalNickname,
                                        avatarUrl: profile.avatarUrl || finalAvatar,
                                        vipType: profile.vipType || 0,
                                    });
                                }
                            } catch (e) {
                                console.warn('Background profile fetch failed', e);
                            }
                        }, 500);
                    } else if (isQQ) {
                        console.log('[QR Poll][qq] Success Status Reached:', {
                            authId: result.authId,
                            nickname: result.nickname,
                            hasCookie: !!result.cookie
                        });

                        qqStore.setQrStatus('confirmed');
                        qqStore.setLoggedIn(true);

                        if (result.cookie) {
                            console.log('[QR Poll][qq] Persisting cookie to state store...');
                            qqStore.setCookie(result.cookie);
                        } else {
                            console.warn('[QR Poll][qq] BACKEND RETURNED EMPTY COOKIE!');
                        }

                        qqStore.setUser({
                            uin: result.authId,
                            nickname: result.nickname || '',
                            avatarUrl: result.avatar || '',
                            vipType: 0,
                        });
                    }

                    setStep('success');

                    // Synchronize full profile in background
                    setTimeout(() => {
                        if (platform) onConnect(platform.name);
                        onClose();
                    }, 1500);
                } else if (status === 'expired') {
                    if (pollTimer.current) clearInterval(pollTimer.current);
                    if (isNetease) neteaseStore.setQrStatus('expired');
                    else if (isQQ) qqStore.setQrStatus('expired');
                    setStep('expired');
                } else if (typeof status === 'object' && status.error) {
                    if (pollTimer.current) clearInterval(pollTimer.current);
                    setPhoneError(status.error);
                    setStep('error');
                }
            } catch (err) {
                console.error('QR poll error:', err);
            }
        }, 2000);
    };

    /** Initialize QR login: generate key + QR URL + start polling */
    const initQrLogin = useCallback(async () => {
        const provider = isNetease ? 'netease' : (isQQ ? 'qq' : '');
        if (!provider) return;

        setLoading(true);
        setPhoneError('');
        setQrUrl('');
        setQrData('');

        try {
            const resp = await AuthService.initQr(provider);
            if (!resp.authId) {
                throw new Error('No auth_id returned');
            }

            if (isNetease) {
                neteaseStore.setQrKey(resp.authId);
                // Netease returns URL to be encoded as QR
                const qrLoginUrl = `https://music.163.com/login?codekey=${resp.authId}`;
                setQrUrl(qrLoginUrl);
                neteaseStore.setQrUrl(qrLoginUrl);
            } else if (isQQ) {
                qqStore.setQrStatus('waiting');
                // QQ returns Base64 image
                if (resp.qrData) {
                    setQrData(resp.qrData);
                }
            }

            setLoading(false);
            startPolling(resp.authId);
        } catch (err: any) {
            console.error('QR login init failed:', err);
            setPhoneError(t('auth.error.unstable', '服务响应异常，请重试'));
            setLoading(false);
        }
    }, [isNetease, isQQ]);

    const lastPlatformRef = useRef<string | null>(null);

    // Reset state when modal opens or platform changes
    useEffect(() => {
        if (!isOpen) {
            if (pollTimer.current) clearInterval(pollTimer.current);
            if (cooldownTimer.current) clearInterval(cooldownTimer.current);
            return;
        }

        if (platform) {
            const isNewPlatform = lastPlatformRef.current !== platform.name;

            // If switching platforms, determine the correct mode
            let currentMode = loginMode;
            if (isNewPlatform) {
                const lastMode = lastLoginModeRef.current;
                if (platform.name.includes('NetEase') && (lastMode === 'phone' || lastMode === 'cookie')) {
                    currentMode = lastMode;
                } else if (platform.name.includes('QQ') && (lastMode === 'phone' || lastMode === 'cookie' || lastMode === 'qr')) {
                    currentMode = lastMode;
                } else {
                    if (platform.name.includes('NetEase')) {
                        currentMode = 'phone';
                    } else if (platform.name.includes('QQ')) {
                        currentMode = 'cookie';
                    } else {
                        currentMode = 'qr';
                    }
                }
                setLoginMode(currentMode);
                lastPlatformRef.current = platform.name;
            }

            // Sync step with mode
            setStep(currentMode === 'phone' ? 'phone' : currentMode === 'cookie' ? 'cookie' : 'qrcode');

            // Atomic state reset only if needed
            setPhoneNumber('');
            setCaptchaCode('');
            setCaptchaCooldown(0);
            setCookieInput(''); // Clear input to prevent leaking between platforms
            if (pollTimer.current) clearInterval(pollTimer.current);
            if (cooldownTimer.current) clearInterval(cooldownTimer.current);

            // If entering cookie mode, sync from corresponding store
            if (currentMode === 'cookie') {
                if (isNetease) setCookieInput(neteaseStore.cookie || '');
                else if (isQQ) setCookieInput(qqStore.cookie || '');
            }

            // 1. Check if already logged in for this platform
            if (isNetease && neteaseStore.isLoggedIn && neteaseStore.user) {
                setStep('logged_in');
                setScannedUser({
                    nickname: neteaseStore.user.nickname,
                    avatarUrl: neteaseStore.user.avatarUrl
                });
                setLoading(false);
                return;
            } else if (isQQ && qqStore.isLoggedIn && qqStore.user) {
                setStep('logged_in');
                setScannedUser({
                    nickname: String(qqStore.user.uin), // Show UIN for QQ
                    avatarUrl: qqStore.user.avatarUrl
                });
                setLoading(false);
                return;
            }

            // Platform specific initialization
            if ((isNetease || isQQ) && currentMode === 'qr') {
                initQrLogin();
            } else {
                setPhoneError('');
                setQrUrl('');
                setQrData('');
                setLoading(false);
                setScannedUser(null);
                if (isQQ && currentMode === 'cookie') {
                    setStep('cookie');
                } else if (isQishui) {
                    setStep('coming_soon');
                }
            }
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
        lastLoginModeRef.current = mode;
        setPhoneError('');
        setQrUrl('');

        if (mode === 'qr') {
            setStep('qrcode');
            initQrLogin();
        } else if (mode === 'phone') {
            setLoading(false);
            setStep('phone');
        } else {
            setLoading(false);
            setStep('cookie');
            if (isNetease) setCookieInput(neteaseStore.cookie || '');
            else if (isQQ) setCookieInput(qqStore.cookie || '');
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
                setScannedUser({
                    nickname: String(user.uin), // Show UIN
                    avatarUrl: user.avatarUrl
                });
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

    /** Handle Logout */
    const handleLogout = async () => {
        setLoading(true);
        try {
            if (isNetease) {
                await NeteaseService.logout(neteaseStore.cookie);
                neteaseStore.logout();
            } else if (isQQ) {
                qqStore.logout();
            }
            // Clear all sensitive internal states
            setScannedUser(null);
            setCookieInput('');
            setPhoneNumber('');
            setCaptchaCode('');

            // Switch back to default mode (QR is usually preferred for a clean start)
            let targetMode: LoginMode = 'qr';

            setLoginMode(targetMode);
            setStep('qrcode');

            if (platform) {
                usePlatformStore.getState().disconnectPlatform(platform.name);
            }

            if (isNetease && targetMode === 'qr') {
                initQrLogin();
            }
        } catch (err) {
            console.error('Logout error:', err);
            if (isNetease) neteaseStore.logout();
            if (isQQ) qqStore.logout();
            onClose();
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
            if (result?.code === 200) {
                setCaptchaCooldown(60);
                cooldownTimer.current = setInterval(() => {
                    setCaptchaCooldown((prev: number) => {
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
            if (data?.code === 200) {
                setStep('success');
                if (cookie) neteaseStore.setCookie(cookie);
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
                    try { await shellOpen(vUrl); } catch (e) { console.warn('Failed to open verify URL:', e); }
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
        qrData,
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
        scannedUser,

        // Setters
        setPhoneNumber,
        setCaptchaCode,
        setPhoneError,
        setCookieInput,

        // Actions
        switchLoginMode,
        handleSimulateLogin,
        handleRefreshQr,
        handleLogout,
        handleCookieLogin,
        handleQQCookieLogin,
        handleSendCaptcha,
        handlePhoneLogin,
    };
}
