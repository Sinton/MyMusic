import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Dropdown } from '../../components/index';

const GeneralSettings: React.FC = () => {
    const { t } = useTranslation();
    const { language, setLanguage, launchOnLogin, toggleLaunchOnLogin } = useSettingsStore();

    const languageOptions = [
        { value: 'zh', label: '中文', icon: <span className="text-xs">🇨🇳</span> },
        { value: 'en', label: 'English', icon: <span className="text-xs">🇺🇸</span> },
    ];

    return (
        <div className="p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-main)]">
                <Globe className="w-5 h-5 text-blue-400" /> {t('settings.general.title')}
            </h3>
            <div className="space-y-6 text-[var(--text-main)]">
                <div className="flex items-center justify-between">
                    <span>{t('settings.general.language')}</span>
                    <Dropdown
                        options={languageOptions}
                        value={language}
                        onChange={setLanguage}
                        width="w-40"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span>{t('settings.general.launchOnLogin')}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={launchOnLogin}
                            onChange={toggleLaunchOnLogin}
                        />
                        <div className="w-11 h-6 bg-[var(--glass-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span>{t('settings.general.searchShortcut')}</span>
                        <span className="text-xs text-[var(--text-muted)]">{t('settings.general.searchShortcutDesc')}</span>
                    </div>
                    <ShortcutRecorder />
                </div>
            </div>
        </div>
    );
};

const ShortcutRecorder: React.FC = () => {
    const { globalSearchShortcut, setGlobalSearchShortcut } = useSettingsStore();
    const [isRecording, setIsRecording] = React.useState(false);
    const [preview, setPreview] = React.useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isRecording) return;
        e.preventDefault();
        if (e.key === 'Escape') {
            setIsRecording(false);
            setPreview('');
            return;
        }

        const keys = [];
        if (e.ctrlKey) keys.push('Ctrl');
        if (e.shiftKey) keys.push('Shift');
        if (e.altKey) keys.push('Alt');
        if (e.metaKey) keys.push('Meta');

        const isModifier = ['Control', 'Shift', 'Alt', 'Meta'].includes(e.key);

        if (!isModifier) {
            const mainKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;
            // Prevent duplicate modifiers if they are somehow detected in e.key
            const finalKeys = [...keys, mainKey];
            setGlobalSearchShortcut(finalKeys.join('+'));
            setIsRecording(false);
            setPreview('');
        } else {
            // Update preview to show currently held modifiers
            setPreview(keys.join('+') + (keys.length > 0 ? '+...' : '...'));
        }
    };

    return (
        <button
            onKeyDown={handleKeyDown}
            onClick={() => {
                setIsRecording(true);
                setPreview('等待按键...');
            }}
            onBlur={() => {
                setIsRecording(false);
                setPreview('');
            }}
            className={`px-4 py-2 rounded-xl border transition-all min-w-[140px] text-sm flex items-center justify-center ${isRecording
                ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)] shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]'
                : 'border-[var(--glass-border)] bg-[var(--glass-highlight)] text-[var(--text-main)] hover:border-[var(--accent-color)]/50'
                }`}
        >
            <span className={isRecording ? 'animate-pulse' : ''}>
                {isRecording ? (preview || '录制中...') : globalSearchShortcut || '无'}
            </span>
        </button>
    );
};

export default GeneralSettings;
