import { useTranslation } from 'react-i18next';
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
}) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col space-y-4 animate-fade-in">
            <div className="text-sm text-[var(--text-secondary)] text-center">
                {t('auth.cookie.desc')}
            </div>

            {/* Steps guide */}
            <div className="text-xs text-[var(--text-secondary)] bg-[var(--glass-highlight)] rounded-lg p-3 space-y-1.5">
                <p>{t('auth.cookie.steps.step1').split('<button>')[0]}<button onClick={() => shellOpen('https://music.163.com')} className="text-[var(--accent-color)] underline">music.163.com</button>{t('auth.cookie.steps.step1').split('</button>')[1]}</p>
                <p>{t('auth.cookie.steps.step2')}</p>
                <p>{t('auth.cookie.steps.step3')}</p>
                <p>{t('auth.cookie.steps.step4')}</p>
            </div>

            {/* Cookie input */}
            <textarea
                value={cookieInput}
                onChange={e => onCookieChange(e.target.value)}
                placeholder={t('auth.cookie.placeholder')}
                className="w-full h-24 px-3 py-2 text-xs bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] resize-none"
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
                {t('auth.cookie.verify')}
            </button>
        </div>
    );
};

export default CookieLoginForm;
