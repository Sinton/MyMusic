import React, { useEffect } from 'react';
import { Settings, Globe, Volume2, Shield, Info, Palette, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlatformStore } from '../stores/usePlatformStore';
import { useSettingsStore } from '../stores/useSettingsStore'; // Import settings store
import { useUIStore } from '../stores/useUIStore';
import { Dropdown } from '../components';

import logoImg from '../assets/logo.png';
import logoBgImg from '../assets/logo_bg.png';

const SettingsView: React.FC = () => {
    const { t, i18n } = useTranslation();
    const disconnectAll = usePlatformStore((state) => state.disconnectAll);
    const { visualizerEnabled, toggleVisualizer } = useUIStore();

    // Use the comprehensive settings store
    const {
        themeMode, accentColor, setThemeMode, setAccentColor,
        language, setLanguage,
        outputDevice, setOutputDevice,
        streamingQuality, setStreamingQuality,
        exclusiveMode, toggleExclusiveMode,
        launchOnLogin, toggleLaunchOnLogin,
        immersiveHeader, toggleImmersiveHeader
    } = useSettingsStore();

    // Ensure i18n is synced with store on mount
    useEffect(() => {
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language, i18n]);

    // Options - Dynamic based on language
    const languageOptions = [
        { value: 'zh', label: '中文', icon: <span className="text-xs">🇨🇳</span> },
        { value: 'en', label: 'English', icon: <span className="text-xs">🇺🇸</span> },
    ];

    const outputOptions = [
        { value: 'default', label: t('settings.audio.outputs.default'), description: t('settings.audio.outputs.defaultDesc') },
        { value: 'speakers', label: t('settings.audio.outputs.speakers'), description: t('settings.audio.outputs.speakersDesc') },
        { value: 'airpods', label: t('settings.audio.outputs.airpods'), description: t('settings.audio.outputs.airpodsDesc') },
        { value: 'dac', label: t('settings.audio.outputs.dac'), description: t('settings.audio.outputs.dacDesc') },
    ];

    const qualityOptions = [
        { value: 'master', label: t('settings.audio.qualities.master'), description: t('settings.audio.qualities.masterDesc') },
        { value: 'hifi', label: t('settings.audio.qualities.hifi'), description: t('settings.audio.qualities.hifiDesc') },
        { value: 'high', label: t('settings.audio.qualities.high'), description: t('settings.audio.qualities.highDesc') },
        { value: 'normal', label: t('settings.audio.qualities.normal'), description: t('settings.audio.qualities.normalDesc') },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-8 pb-32">
            <section>
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Settings className="w-8 h-8" /> {t('settings.title')}
                </h2>

                <div className="grid gap-6">
                    {/* Appearance - New Module */}
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
                                    {(['green', 'blue', 'orange', 'purple', 'pink'] as const).map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setAccentColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${accentColor === color ? 'border-[var(--text-main)] scale-110' : 'border-transparent'
                                                }`}
                                            style={{ backgroundColor: `var(--color-${color}, ${getColorValue(color)})` }}
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

                    {/* General - Refined */}
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

                    {/* Audio - Refined */}
                    <div className="p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-[var(--accent-color)]" /> {t('settings.audio.title')}
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{t('settings.audio.output')}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">{t('settings.audio.outputDesc')}</div>
                                </div>
                                <Dropdown
                                    options={outputOptions}
                                    value={outputDevice}
                                    onChange={setOutputDevice}
                                    width="w-64"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{t('settings.audio.quality')}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">{t('settings.audio.qualityDesc')}</div>
                                </div>
                                <Dropdown
                                    options={qualityOptions}
                                    value={streamingQuality}
                                    onChange={setStreamingQuality}
                                    width="w-64"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {t('settings.audio.exclusive')} <span className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 uppercase">Pro</span>
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)]">{t('settings.audio.exclusiveDesc')}</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={exclusiveMode}
                                        onChange={toggleExclusiveMode}
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* About & Info - New Module */}
                    <div className="p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-main)]">
                            <Info className="w-5 h-5 text-gray-400" /> {t('settings.about.title')}
                        </h3>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                {/* <div className="w-14 h-14 bg-black rounded-2xl shadow-lg flex items-center justify-center text-2xl overflow-hidden">
                                    <img src={logoImg} className="w-full h-full p-0.5 object-contain invert dark:invert-0" alt="Vibe Music" />
                                </div> */}
                                <img src={logoBgImg} className="w-14 h-14 rounded-2xl shadow-lg object-cover" alt="Vibe Music" />
                                <div>
                                    <div className="font-bold text-lg text-[var(--text-main)]">{t('settings.about.appName')}</div>
                                    <div className="text-sm text-[var(--text-secondary)]">{t('settings.about.appDesc')}</div>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-lg text-sm hover:bg-[var(--glass-border)] text-[var(--text-main)] transition-colors">
                                {t('settings.about.checkUpdates')}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-[var(--text-main)]">
                            <button className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-left group">
                                <span>{t('settings.about.terms')}</span>
                                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-left group">
                                <span>{t('settings.about.privacy')}</span>
                                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-left group">
                                <span>{t('settings.about.licenses')}</span>
                                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-left group">
                                <span>{t('settings.about.github')}</span>
                                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Account Zone */}
                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                            <Shield className="w-5 h-5" /> {t('settings.dangerZone.title')}
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-[var(--text-secondary)]">
                                {t('settings.dangerZone.desc')}
                            </div>
                            <button
                                onClick={disconnectAll}
                                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-all font-medium"
                            >
                                {t('settings.dangerZone.button')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Helper for inline styles
const getColorValue = (color: string) => {
    const map: Record<string, string> = {
        pink: '#ec4899',
        purple: '#8b5cf6',
        blue: '#3b82f6',
        green: '#10b981',
        orange: '#f97316'
    };
    return map[color] || '#ec4899';
};

export default SettingsView;
