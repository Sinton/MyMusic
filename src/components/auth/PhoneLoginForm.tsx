import React from 'react';
import { Send } from 'lucide-react';
import type { LoginFormProps } from './authTypes';

interface PhoneLoginFormProps extends LoginFormProps {
    phoneNumber: string;
    captchaCode: string;
    captchaCooldown: number;
    onPhoneChange: (value: string) => void;
    onCaptchaChange: (value: string) => void;
    onSendCaptcha: () => void;
    onLogin: () => void;
}

const PhoneLoginForm: React.FC<PhoneLoginFormProps> = ({
    accentColor,
    phoneError,
    phoneNumber,
    captchaCode,
    captchaCooldown,
    onPhoneChange,
    onCaptchaChange,
    onSendCaptcha,
    onLogin,
}) => (
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
                onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
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
                onChange={(e) => onCaptchaChange(e.target.value.replace(/\D/g, ''))}
                placeholder="验证码"
                maxLength={6}
                className="flex-1 px-4 py-3 bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-color)] transition-colors"
            />
            <button
                onClick={onSendCaptcha}
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
            onClick={onLogin}
            disabled={!phoneNumber || !captchaCode}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shadow-lg"
            style={{ background: accentColor }}
        >
            登录
        </button>
    </div>
);

export default PhoneLoginForm;
