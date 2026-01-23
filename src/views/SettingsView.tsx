import React from 'react';
import { Settings, Globe, Volume2, Shield, Info, Palette, HardDrive, Layout, ChevronRight } from 'lucide-react';
import { usePlatformStore } from '../stores/usePlatformStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useSettingsStore } from '../stores/useSettingsStore'; // Import settings store
import { Dropdown } from '../components';

const SettingsView: React.FC = () => {
    const disconnectAll = usePlatformStore((state) => state.disconnectAll);
    const { visualizerEnabled, toggleVisualizer } = usePlayerStore();

    // Use the comprehensive settings store
    const {
        themeMode, accentColor, setThemeMode, setAccentColor,
        language, setLanguage,
        outputDevice, setOutputDevice,
        streamingQuality, setStreamingQuality,
        exclusiveMode, toggleExclusiveMode,
        launchOnLogin, toggleLaunchOnLogin
    } = useSettingsStore();

    // Options Mock - In real app, these could come from config or API
    const languageOptions = [
        { value: 'en', label: 'English', icon: <span className="text-xs">🇺🇸</span> },
        { value: 'zh', label: '中文', icon: <span className="text-xs">🇨🇳</span> },
        { value: 'ja', label: '日本語', icon: <span className="text-xs">🇯🇵</span> },
    ];

    const outputOptions = [
        { value: 'default', label: 'System Default', description: 'Use system sound settings' },
        { value: 'speakers', label: 'MacBook Pro Speakers', description: 'Built-in Output' },
        { value: 'airpods', label: 'AirPods Pro', description: 'Bluetooth' },
        { value: 'dac', label: 'External DAC (USB)', description: 'FiiO K5 Pro' },
    ];

    const qualityOptions = [
        { value: 'master', label: 'Master', description: 'Hi-Res Lossless • Up to 9216kbps' },
        { value: 'hifi', label: 'Hi-Fi', description: 'Lossless • 1411kbps' },
        { value: 'high', label: 'High', description: 'AAC • 320kbps' },
        { value: 'normal', label: 'Normal', description: 'AAC • 128kbps' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-8 pb-32">
            <section>
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Settings className="w-8 h-8" /> Settings
                </h2>

                <div className="grid gap-6">
                    {/* Appearance - New Module */}
                    <div className="p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Palette className="w-5 h-5 text-purple-400" /> Appearance
                        </h3>
                        <div className="space-y-6">
                            {/* Theme Mode */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-[var(--text-main)]">Theme</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Choose your preferred interface style</div>
                                </div>
                                <div className="flex bg-[var(--glass-border)] p-1 rounded-lg border border-[var(--glass-border)]">
                                    {(['light', 'system', 'dark'] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setThemeMode(mode)}
                                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${themeMode === mode
                                                ? 'bg-[var(--glass-border)] text-[var(--text-main)] shadow-sm'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                                                }`}
                                        >
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Accent Color */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">Accent Color</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Personalize your Vibe</div>
                                </div>
                                <div className="flex gap-3">
                                    {(['pink', 'purple', 'blue', 'green', 'orange'] as const).map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setAccentColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${accentColor === color ? 'border-white scale-110' : 'border-transparent'
                                                }`}
                                            style={{ backgroundColor: `var(--color-${color}, ${getColorValue(color)})` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Visualizer Toggle */}
                            <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
                                <div>
                                    <div className="font-medium">Audio Visualizer</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Show dynamic effects in full screen</div>
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
                        </div>
                    </div>

                    {/* General - Refined */}
                    <div className="p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-main)]">
                            <Globe className="w-5 h-5 text-blue-400" /> General
                        </h3>
                        <div className="space-y-6 text-[var(--text-main)]">
                            <div className="flex items-center justify-between">
                                <span>Language</span>
                                <Dropdown
                                    options={languageOptions}
                                    value={language}
                                    onChange={setLanguage}
                                    width="w-40"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Example Toggle</span>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="accent-[var(--accent-color)] h-4 w-4"
                                        checked={launchOnLogin}
                                        onChange={toggleLaunchOnLogin}
                                    />
                                    <span className="text-sm text-[var(--text-secondary)]">Launch on login</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Audio - Refined */}
                    <div className="p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-[var(--accent-color)]" /> Audio
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">Output Device</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Select active audio output</div>
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
                                    <div className="font-medium">Streaming Quality</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Wi-Fi streaming preference</div>
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
                                        Exclusive Mode <span className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 uppercase">Pro</span>
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)]">Bypass system audio mixer</div>
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
                            <Info className="w-5 h-5 text-gray-400" /> About
                        </h3>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center text-2xl">
                                    🎵
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-[var(--text-main)]">Vibe Music</div>
                                    <div className="text-sm text-[var(--text-secondary)]">Version 1.0.0 (Beta)</div>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-lg text-sm hover:bg-[var(--glass-border)] text-[var(--text-main)] transition-colors">
                                Check for Updates
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-[var(--text-main)]">
                            <button className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-left group">
                                <span>Terms of Service</span>
                                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-left group">
                                <span>Privacy Policy</span>
                                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-left group">
                                <span>Open Source Licenses</span>
                                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-left group">
                                <span>GitHub Repository</span>
                                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Account Zone */}
                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                            <Shield className="w-5 h-5" /> Danger Zone
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-[var(--text-secondary)]">
                                Disconnect all linked services and clear local cache.
                            </div>
                            <button
                                onClick={disconnectAll}
                                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-all font-medium"
                            >
                                Disconnect All
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
