import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Dropdown } from '../index';

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
            </div>
        </div>
    );
};

export default GeneralSettings;
