import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation, Trans } from 'react-i18next';
import { X, QrCode, Smartphone, CheckCircle, Loader2, AlertTriangle, RefreshCw, Phone, Send, ShieldCheck, Cookie } from 'lucide-react';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import { QRCodeSVG } from 'qrcode.react';
import { PlatformBadge } from './index';
import { NeteaseService } from '../services/NeteaseService';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import type { Platform } from '../types';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: Platform | null;
    onConnect: (platformName: string) => void;
}

type AuthStep = 'qrcode' | 'phone' | 'cookie' | 'scanning' | 'success' | 'expired' | 'error' | 'verify';
type LoginMode = 'qr' | 'phone' | 'cookie';

const getPlatformKey = (name: string): string => {
    if (name.includes('NetEase')) return 'netease';
    if (name.includes('QQ')) return 'qq';
    if (name.includes('Soda')) return 'soda';
    return name;
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, platform, onConnect }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState<AuthStep>('qrcode');
    const [loading, setLoading] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [loginMode, setLoginMode] = useState<LoginMode>('phone'); // Default to phone login
    const [phoneNumber, setPhoneNumber] = useState('');
    const [captchaCode, setCaptchaCode] = useState('');
    const [captchaCooldown, setCaptchaCooldown] = useState(0);
    const [phoneError, setPhoneError] = useState('');
    const [verifyUrl, setVerifyUrl] = useState('');
    const [cookieInput, setCookieInput] = useState('');
    const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const isNetease = platform?.name?.includes('NetEase') ?? false;
    const neteaseStore = useNeteaseStore();

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

            // Auto-start QR generation for NetEase QR mode
            if (isNetease && loginMode === 'qr') {
                initQrLogin();
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
            // Step 1: Get QR key
            const keyData: any = await NeteaseService.getQrKey();
            const unikey = keyData?.unikey || keyData?.data?.unikey;
            if (!unikey) {
                console.error('Failed to get QR key:', keyData);
                setStep('error');
                setLoading(false);
                return;
            }
            neteaseStore.setQrKey(unikey);

            // Step 2: Generate QR URL (the URL to encode as QR)
            const qrLoginUrl = `https://music.163.com/login?codekey=${unikey}`;
            setQrUrl(qrLoginUrl);
            neteaseStore.setQrUrl(qrLoginUrl);
            setLoading(false);

            // Step 3: Start polling for scan status
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

        // Store user info from 802 response as fallback
        let scannedUser: { nickname?: string; avatarUrl?: string } = {};

        pollTimer.current = setInterval(async () => {
            try {
                const result = await NeteaseService.checkQrLogin(key);
                console.log('[QR Poll] code:', result.code, 'cookie:', result?.cookie ? 'present' : 'missing', 'nickname:', result.nickname);
                const code = result?.code;

                if (code === 800) {
                    // QR expired
                    setStep('expired');
                    neteaseStore.setQrStatus('expired');
                    if (pollTimer.current) clearInterval(pollTimer.current);
                } else if (code === 802) {
                    // User scanned, waiting for confirmation
                    setStep('scanning');
                    neteaseStore.setQrStatus('scanned');
                    // Save user info from 802 response (NetEase returns nickname/avatar here)
                    if (result.nickname) {
                        scannedUser = { nickname: result.nickname, avatarUrl: result.avatarUrl };
                    }
                    // Also save cookie if present
                    if (result.cookie) {
                        neteaseStore.setCookie(result.cookie);
                    }
                } else if (code === 803) {
                    // Success!
                    if (pollTimer.current) clearInterval(pollTimer.current);
                    setStep('success');
                    neteaseStore.setQrStatus('confirmed');

                    // Save cookie from response
                    if (result.cookie) {
                        neteaseStore.setCookie(result.cookie);
                    }

                    // Fetch user profile
                    try {
                        const cookie = result.cookie || neteaseStore.cookie;
                        const statusData = await NeteaseService.getLoginStatus(cookie);
                        const profile = statusData?.data?.profile || statusData?.profile;
                        if (profile) {
                            neteaseStore.setUser({
                                userId: profile.userId,
                                nickname: profile.nickname,
                                avatarUrl: profile.avatarUrl,
                                vipType: profile.vipType || 0,
                            });
                        }
                    } catch (e) {
                        console.warn('Failed to fetch user profile:', e);
                        // Fallback to scanned user info
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

                    // Close modal after brief success animation
                    setTimeout(() => {
                        onConnect(platform!.name);
                        onClose();
                    }, 1500);
                } else if (code === 8821 && scannedUser.nickname) {
                    // NetEase security blocked final confirmation, but we have user info from 802
                    // Treat as success with limited functionality (no cookie = limited API access)
                    console.warn('[QR Poll] Security block (8821), using fallback user info from 802');
                    if (pollTimer.current) clearInterval(pollTimer.current);
                    setStep('success');
                    neteaseStore.setQrStatus('confirmed');

                    neteaseStore.setUser({
                        userId: 0,
                        nickname: scannedUser.nickname,
                        avatarUrl: scannedUser.avatarUrl || '',
                        vipType: 0,
                    });
                    neteaseStore.setLoggedIn(true);

                    setTimeout(() => {
                        onConnect(platform!.name);
                        onClose();
                    }, 1500);
                } else if (code !== 801) {
                    // Unknown error code
                    console.error('[QR Poll] Unexpected code:', code, result.message);
                    if (pollTimer.current) clearInterval(pollTimer.current);
                    setStep('error');
                    neteaseStore.setQrStatus('error');
                }
                // code === 801: still waiting, do nothing
            } catch (err) {
                console.error('QR poll error:', err);
            }
        }, 3000);
    };

    /** Handle simulated login for non-NetEase platforms */
    const handleSimulateLogin = () => {
        if (isNetease) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('success');
            setTimeout(() => {
                if (platform) onConnect(platform.name);
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
        } else if (mode === 'cookie') {
            setStep('cookie');
        } else {
            setStep('phone');
        }
    };

    /** Login with pasted cookie */
    const handleCookieLogin = async () => {
        let trimmed = cookieInput.trim();
        if (!trimmed) {
            setPhoneError('请粘贴 Cookie');
            return;
        }
        // If user pasted just the MUSIC_U value without key name, wrap it
        if (!trimmed.includes('=')) {
            trimmed = `MUSIC_U=${trimmed}`;
        } else if (!trimmed.toUpperCase().includes('MUSIC_U')) {
            setPhoneError('Cookie 中需要包含 MUSIC_U');
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
                setPhoneError('Cookie 无效或已过期，请重新获取');
            }
        } catch (err) {
            console.error('Cookie login failed:', err);
            setPhoneError('验证失败，请检查 Cookie 是否正确');
        } finally {
            setLoading(false);
        }
    };

    /** Send SMS captcha */
    const handleSendCaptcha = async () => {
        if (!phoneNumber || phoneNumber.length < 11) {
            setPhoneError('请输入正确的手机号');
            return;
        }
        setPhoneError('');
        setLoading(true);
        try {
            const result = await NeteaseService.sendCaptcha(phoneNumber);
            console.log('[Captcha] send result:', result);
            if (result?.code === 200) {
                // Start 60s cooldown
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
                // Human verification required
                const vUrl = result?.data?.url || '';
                if (vUrl) {
                    setVerifyUrl(vUrl);
                    setStep('verify');
                    try { await shellOpen(vUrl); } catch (e) { console.warn('Failed to open verify URL:', e); }
                } else {
                    setPhoneError('需要人机验证，请稍后重试');
                }
            } else {
                setPhoneError(result?.message || '发送验证码失败');
            }
        } catch (err: any) {
            console.error('Send captcha failed:', err);
            setPhoneError('发送失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    /** Login with phone + captcha */
    const handlePhoneLogin = async () => {
        if (!phoneNumber || !captchaCode) {
            setPhoneError('请输入手机号和验证码');
            return;
        }
        setPhoneError('');
        setLoading(true);
        try {
            const { data, cookie } = await NeteaseService.loginCellphone(phoneNumber, captchaCode);
            console.log('[PhoneLogin] data:', data, 'cookie:', cookie ? 'present' : 'missing');

            if (data?.code === 200) {
                // Success
                setStep('success');

                if (cookie) {
                    neteaseStore.setCookie(cookie);
                }

                // Extract profile from login response
                const profile = data?.profile || data?.account;
                if (profile) {
                    neteaseStore.setUser({
                        userId: profile.userId || profile.id || 0,
                        nickname: profile.nickname || '',
                        avatarUrl: profile.avatarUrl || '',
                        vipType: profile.vipType || 0,
                    });
                }

                neteaseStore.setLoggedIn(true);

                setTimeout(() => {
                    onConnect(platform!.name);
                    onClose();
                }, 1500);
            } else if (data?.code === -462) {
                // Human verification required
                const vUrl = data?.data?.url || '';
                if (vUrl) {
                    setVerifyUrl(vUrl);
                    setStep('verify');
                    // Open verification in system browser
                    try {
                        await shellOpen(vUrl);
                    } catch (e) {
                        console.warn('Failed to open verify URL:', e);
                    }
                } else {
                    setPhoneError('需要人机验证，但无法获取验证链接');
                }
            } else {
                setPhoneError(data?.message || data?.msg || '登录失败');
            }
        } catch (err: any) {
            console.error('Phone login failed:', err);
            setPhoneError('登录失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !platform) return null;

    const platformColors: Record<string, string> = {
        'NetEase Cloud': '#e60026',
        'QQ Music': '#31c27c',
        'Soda Music': '#ffde00',
    };

    const accentColor = platformColors[platform.name] || '#fff';
    const platformNameTranslated = t(`platforms.${getPlatformKey(platform.name)}`);

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
                {isNetease && (step === 'qrcode' || step === 'phone' || step === 'cookie') && !loading && (
                    <div className="flex mx-8 mt-4 p-1 bg-[var(--glass-highlight)] rounded-lg">
                        <button
                            onClick={() => switchLoginMode('phone')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all ${loginMode === 'phone'
                                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                                }`}
                        >
                            <Phone className="w-3.5 h-3.5" />
                            手机号
                        </button>
                        <button
                            onClick={() => switchLoginMode('qr')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all ${loginMode === 'qr'
                                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                                }`}
                        >
                            <QrCode className="w-3.5 h-3.5" />
                            扫码
                        </button>
                        <button
                            onClick={() => switchLoginMode('cookie')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all ${loginMode === 'cookie'
                                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                                }`}
                        >
                            <Cookie className="w-3.5 h-3.5" />
                            Cookie
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="p-8">
                    {/* Phone Login Step */}
                    {step === 'phone' && !loading && (
                        <div className="flex flex-col space-y-5 animate-fade-in">
                            <div className="text-sm text-[var(--text-secondary)] text-center">
                                输入手机号，获取验证码登录
                            </div>

                            {/* Phone Number Input */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-3 py-3 bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-main)] shrink-0">
                                    <span>🇨🇳</span>
                                    <span>+86</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                                        setPhoneError('');
                                    }}
                                    placeholder="请输入手机号"
                                    maxLength={11}
                                    className="flex-1 px-4 py-3 bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-color)] transition-colors"
                                />
                            </div>

                            {/* Captcha Input + Send Button */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={captchaCode}
                                    onChange={(e) => {
                                        setCaptchaCode(e.target.value.replace(/\D/g, ''));
                                        setPhoneError('');
                                    }}
                                    placeholder="验证码"
                                    maxLength={6}
                                    className="flex-1 px-4 py-3 bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-color)] transition-colors"
                                />
                                <button
                                    onClick={handleSendCaptcha}
                                    disabled={captchaCooldown > 0 || !phoneNumber}
                                    className="shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                                    style={{
                                        background: captchaCooldown > 0 ? 'var(--glass-highlight)' : accentColor,
                                        color: captchaCooldown > 0 ? 'var(--text-secondary)' : 'white',
                                    }}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {captchaCooldown > 0 ? `${captchaCooldown}s` : '获取验证码'}
                                </button>
                            </div>

                            {/* Error */}
                            {phoneError && (
                                <p className="text-xs text-red-500 text-center animate-fade-in">{phoneError}</p>
                            )}

                            {/* Login Button */}
                            <button
                                onClick={handlePhoneLogin}
                                disabled={!phoneNumber || !captchaCode}
                                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shadow-lg"
                                style={{ background: accentColor }}
                            >
                                登录
                            </button>
                        </div>
                    )}

                    {/* Cookie Login Step */}
                    {step === 'cookie' && !loading && (
                        <div className="flex flex-col space-y-4 animate-fade-in">
                            <div className="text-sm text-[var(--text-secondary)] text-center">
                                从浏览器获取 Cookie 登录（最稳定）
                            </div>

                            {/* Steps guide */}
                            <div className="text-xs text-[var(--text-secondary)] bg-[var(--glass-highlight)] rounded-lg p-3 space-y-1.5">
                                <p>1. 在浏览器中打开 <button onClick={() => shellOpen('https://music.163.com')} className="text-[var(--accent-color)] underline">music.163.com</button> 并登录</p>
                                <p>2. 按 F12 打开开发者工具</p>
                                <p>3. 切换到 <b>Application</b> → <b>Cookies</b></p>
                                <p>4. 找到 <b>MUSIC_U</b> 对应的值，复制粘贴到下方</p>
                            </div>

                            {/* Cookie input */}
                            <textarea
                                value={cookieInput}
                                onChange={e => setCookieInput(e.target.value)}
                                placeholder="粘贴 Cookie（至少包含 MUSIC_U=xxx）"
                                className="w-full h-24 px-3 py-2 text-xs bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] resize-none font-mono"
                            />

                            {/* Error */}
                            {phoneError && (
                                <p className="text-xs text-red-500 text-center animate-fade-in">{phoneError}</p>
                            )}

                            {/* Login Button */}
                            <button
                                onClick={handleCookieLogin}
                                disabled={!cookieInput.trim()}
                                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shadow-lg"
                                style={{ background: accentColor }}
                            >
                                验证并登录
                            </button>
                        </div>
                    )}

                    {/* QR Code Step */}
                    {step === 'qrcode' && !loading && (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="text-sm text-[var(--text-secondary)] text-center px-4">
                                <Trans
                                    i18nKey="auth.scanDesc"
                                    values={{ platform: platformNameTranslated }}
                                    components={{ b: <b /> }}
                                />
                            </div>

                            {/* QR Code */}
                            <div
                                className="w-48 h-48 bg-white p-3 rounded-xl shadow-inner cursor-pointer group relative"
                                onClick={isNetease ? undefined : handleSimulateLogin}
                            >
                                {isNetease && qrUrl ? (
                                    <QRCodeSVG
                                        value={qrUrl}
                                        size={168}
                                        level="M"
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <>
                                        <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                            <QrCode className="w-24 h-24 text-gray-800 opacity-20" />
                                        </div>
                                        {!isNetease && (
                                            <div className="absolute inset-0 bg-black/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                <Smartphone className="w-8 h-8 mb-2 animate-bounce" />
                                                <span className="text-xs font-bold">{t('auth.clickToSimulate')}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                {t('auth.waiting')}
                            </div>
                        </div>
                    )}

                    {/* Scanning Step (user scanned, waiting for confirm on phone) */}
                    {step === 'scanning' && (
                        <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Smartphone className="w-8 h-8 text-blue-400 animate-bounce" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">{t('auth.scanned', '已扫描')}</h3>
                            <p className="text-sm text-[var(--text-secondary)] text-center">
                                {t('auth.confirmOnPhone', '请在手机上确认登录')}
                            </p>
                        </div>
                    )}

                    {/* Loading step */}
                    {loading && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-12 h-12 text-[var(--text-main)] animate-spin" />
                            <p className="text-sm text-[var(--text-secondary)]">{t('auth.authorizing')}</p>
                        </div>
                    )}

                    {/* Success */}
                    {step === 'success' && (
                        <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">{t('auth.success')}</h3>
                            <p className="text-sm text-[var(--text-secondary)] text-center">
                                {t('auth.syncing')}
                            </p>
                        </div>
                    )}

                    {/* Human Verification Required */}
                    {step === 'verify' && (
                        <div className="py-6 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">需要人机验证</h3>
                            <p className="text-sm text-[var(--text-secondary)] text-center px-4">
                                已在浏览器中打开验证页面，请完成验证后点击下方按钮重试登录
                            </p>
                            <div className="flex flex-col gap-2 w-full">
                                <button
                                    onClick={handlePhoneLogin}
                                    className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                                    style={{ background: accentColor }}
                                >
                                    验证完成，重新登录
                                </button>
                                {verifyUrl && (
                                    <button
                                        onClick={() => shellOpen(verifyUrl)}
                                        className="w-full py-2.5 rounded-xl font-bold text-sm transition-all bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] text-[var(--text-secondary)]"
                                    >
                                        重新打开验证页面
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Expired */}
                    {step === 'expired' && (
                        <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-yellow-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">{t('auth.expired', '二维码已过期')}</h3>
                            <button
                                onClick={handleRefreshQr}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-sm text-[var(--text-main)]"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {t('auth.refresh', '刷新二维码')}
                            </button>
                        </div>
                    )}

                    {/* Error */}
                    {step === 'error' && (
                        <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">{t('auth.error', '连接失败')}</h3>
                            <button
                                onClick={handleRefreshQr}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-sm text-[var(--text-main)]"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {t('auth.retry', '重试')}
                            </button>
                        </div>
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
