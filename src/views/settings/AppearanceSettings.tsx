import React from 'react';
import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useUIStore } from '../../stores/useUIStore';
import { ACCENT_COLORS, ACCENT_COLOR_ORDER } from '../../config';

const AppearanceSettings: React.FC = () => {
    const { t } = useTranslation();
    const { themeMode, accentColor, setThemeMode, setAccentColor } = useSettingsStore();
    const { visualizerEnabled, toggleVisualizer } = useUIStore();
    const { immersiveHeader, toggleImmersiveHeader } = useSettingsStore();

    return (
        <div className="p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" /> {t('settings.appearance.title')}
            </h3>
            <div className="space-y-6">
                {/* Theme Mode */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-[var(--text-main)]">{t('settings.appearance.theme')}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{t('settings.appearance.themeDesc')}</div>
                    </div>
                    <div className="flex bg-[var(--glass-border)] p-1 rounded-lg border border-[var(--glass-border)]">
                        {(['light', 'dark', 'system'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setThemeMode(mode)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${themeMode === mode
                                    ? 'bg-[var(--glass-border)] text-[var(--text-main)] shadow-sm'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                {t(`settings.appearance.themes.${mode}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accent Color */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">{t('settings.appearance.accent')}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{t('settings.appearance.accentDesc')}</div>
                    </div>
                    <div className="flex gap-3">
                        {ACCENT_COLOR_ORDER.map((color) => (
                            <button
                                key={color}
                                onClick={() => setAccentColor(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${accentColor === color ? 'border-[var(--text-main)] scale-110' : 'border-transparent'
                                    }`}
                                style={{ backgroundColor: ACCENT_COLORS[color] }}
                            />
                        ))}
                    </div>
                </div>

                {/* Visualizer Toggle */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
                    <div>
                        <div className="font-medium">{t('settings.appearance.visualizer')}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{t('settings.appearance.visualizerDesc')}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={visualizerEnabled}
                            onChange={toggleVisualizer}
                        />
                        <div className="w-11 h-6 bg-[var(--glass-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                    </label>
                </div>

                {/* Immersive Header Toggle */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
                    <div>
                        <div className="font-medium">{t('settings.appearance.immersiveHeader')}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{t('settings.appearance.immersiveHeaderDesc')}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={immersiveHeader}
                            onChange={toggleImmersiveHeader}
                        />
                        <div className="w-11 h-6 bg-[var(--glass-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;
