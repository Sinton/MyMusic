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

    /** Poll QR scan status every 3 seconds */
    const startPolling = (key: string) => {
        if (pollTimer.current) clearInterval(pollTimer.current);

        let currentUser: { nickname?: string; avatarUrl?: string } = {};

        pollTimer.current = setInterval(async () => {
            try {
                const result: any = await NeteaseService.checkQrLogin(key);
                const code = result?.code;

                // Debug logging
                if (code !== 801) {
                    console.log(`[QR Poll] Code: ${code} | Cookie: ${result.cookie ? 'YES' : 'NO'}`);
                }

                if (code === 802) {
                    neteaseStore.setQrStatus('scanned');
                    setStep('scanning');
                    if (result?.nickname || result?.avatarUrl) {
                        const info = {
                            nickname: result.nickname || t('auth.scannedUser'),
                            avatarUrl: result.avatarUrl || ''
                        };
                        currentUser = info;
                        setScannedUser(info);
                    }
                } else if (code === 803) {
                    console.log('[QR Poll] SUCCESS (803)! Scanned user:', currentUser.nickname);
                    if (pollTimer.current) clearInterval(pollTimer.current);

                    const responseCookie = result?.cookie || '';
                    if (responseCookie) {
                        console.log('[QR Poll] Saving session cookie...');
                        neteaseStore.setCookie(responseCookie);
                    }

                    // Shift UI to success IMMEDIATELY
                    neteaseStore.setQrStatus('confirmed');
                    setStep('success');
                    neteaseStore.setLoggedIn(true);

                    // Background: Fetch full profile
                    (async () => {
                        try {
                            const cookie = responseCookie || neteaseStore.cookie;
                            if (cookie) {
                                console.log('[QR Poll] Fetching final profile from account/get...');
                                const statusData = await NeteaseService.getLoginStatus(cookie);
                                const profile = statusData?.data?.profile || statusData?.profile;
                                if (profile) {
                                    neteaseStore.setUser({
                                        userId: profile.userId,
                                        nickname: profile.nickname || currentUser.nickname || '',
                                        avatarUrl: profile.avatarUrl || currentUser.avatarUrl || '',
                                        vipType: profile.vipType || 0,
                                    });
                                    console.log('[QR Poll] Final Profile Synced:', profile.nickname);
                                }
                            }
                        } catch (profileErr) {
                            console.warn('[QR Poll] Background Profile Fetch Error:', profileErr);
                            // Fallback to what we scanned earlier
                            if (currentUser.nickname) {
                                neteaseStore.setUser({
                                    userId: 0,
                                    nickname: currentUser.nickname,
                                    avatarUrl: currentUser.avatarUrl || '',
                                    vipType: 0,
                                });
                            }
                        }
                    })();

                    // Closing delay for success animation
                    setTimeout(() => {
                        console.log('[QR Poll] Closing Auth Modal...');
                        if (platform) onConnect(platform.name);
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
        setPhoneError('');
        setQrUrl('');
        try {
            const keyData: any = await NeteaseService.getQrKey();
            const unikey = keyData?.unikey || keyData?.data?.unikey;
            if (!unikey) {
                const errorMsg = keyData?.message || keyData?.data?.blockText || t('auth.error.networkRisk');
                console.error('Failed to get QR key:', keyData);
                setPhoneError(errorMsg);
                setLoading(false);
                return;
            }
            neteaseStore.setQrKey(unikey);

            const qrLoginUrl = `https://music.163.com/login?codekey=${unikey}`;
            setQrUrl(qrLoginUrl);
            neteaseStore.setQrUrl(qrLoginUrl);
            setLoading(false);

            startPolling(unikey);
        } catch (err: any) {
            console.error('QR login init failed:', err);
            let errorMsg = t('auth.error.unstable', '服务响应异常，请重试');
            const rawErrorText = String(err?.message || err?.data?.blockText || err || '').toLowerCase();

            if (rawErrorText.includes('404') || rawErrorText.includes('未找到') || rawErrorText.includes('unikey1') || rawErrorText.includes('not found')) {
                errorMsg = t('auth.error.offline', '登录服务器繁忙，请稍后再试');
            } else if (rawErrorText.includes('network') || rawErrorText.includes('timeout') || rawErrorText.includes('failed to fetch')) {
                errorMsg = t('auth.error.unstable_connection', '连接不稳定，请手动刷新');
            } else if (err?.data?.blockText) {
                errorMsg = err.data.blockText;
            }

            setPhoneError(errorMsg);
            setQrUrl('');
            setLoading(false);
        }
    }, [isNetease]);

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
            if (isNetease && currentMode === 'qr') {
                initQrLogin();
            } else {
                setPhoneError('');
                setQrUrl('');
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
