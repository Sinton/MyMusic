import React from 'react';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import type { LoginFormProps } from './authTypes';

interface CookieLoginFormProps extends LoginFormProps {
    cookieInput: string;
    onCookieChange: (value: string) => void;
    onLogin: () => void;
}

const CookieLoginForm: React.FC<CookieLoginFormProps> = ({
    accentColor,
    phoneError,
    cookieInput,
    onCookieChange,
    onLogin,
}) => (
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
            onChange={e => onCookieChange(e.target.value)}
            placeholder="粘贴 Cookie（至少包含 MUSIC_U=xxx）"
            className="w-full h-24 px-3 py-2 text-xs bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] resize-none font-mono"
        />

        {/* Error */}
        {phoneError && (
            <p className="text-xs text-red-500 text-center animate-fade-in">{phoneError}</p>
        )}

        {/* Login Button */}
        <button
            onClick={onLogin}
            disabled={!cookieInput.trim()}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shadow-lg"
            style={{ background: accentColor }}
        >
            验证并登录
        </button>
    </div>
);

export default CookieLoginForm;
