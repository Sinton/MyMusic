import React from 'react';
import { Settings, Globe, Volume2, Shield } from 'lucide-react';
import { usePlatformStore } from '../stores/usePlatformStore';
import { usePlayerStore } from '../stores/usePlayerStore';

const SettingsView: React.FC = () => {
    const disconnectAll = usePlatformStore((state) => state.disconnectAll);
    const { visualizerEnabled, toggleVisualizer } = usePlayerStore();

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pt-8">
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Settings className="w-8 h-8" /> Settings
                </h2>

                <div className="space-y-4">
                    {/* General */}
                    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)]">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" /> General
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Language</span>
                                <select className="bg-[rgba(0,0,0,0.3)] border border-[var(--glass-border)] rounded-md px-3 py-1 text-sm outline-none">
                                    <option>English</option>
                                    <option>中文</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Startup</span>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="accent-[var(--accent-color)]" defaultChecked />
                                    <span className="text-sm text-[var(--text-secondary)]">Launch on login</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Interface */}
                    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)]">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            Full Screen Player
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">Audio Visualizer</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Display dynamic waveform effects</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={visualizerEnabled}
                                        onChange={toggleVisualizer}
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Audio & Playback */}
                    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)]">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-[var(--accent-color)]" /> Audio & Playback
                        </h3>
                        <div className="space-y-6">
                            {/* Output Device */}
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div>
                                    <div className="font-medium">Output Device</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Select playback device</div>
                                </div>
                                <select className="bg-[rgba(0,0,0,0.3)] border border-[var(--glass-border)] rounded-lg px-4 py-2 text-sm outline-none w-48 text-right focus:border-[var(--accent-color)] transition-colors">
                                    <option>System Default</option>
                                    <option>MacBook Pro Speakers</option>
                                    <option>AirPods Pro</option>
                                    <option>External DAC (USB)</option>
                                </select>
                            </div>

                            {/* Streaming Quality */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">Streaming Quality (Wi-Fi)</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Adjust for best performance</div>
                                </div>
                                <select className="bg-[rgba(0,0,0,0.3)] border border-[var(--glass-border)] rounded-lg px-4 py-2 text-sm outline-none w-48 text-right focus:border-[var(--accent-color)] transition-colors">
                                    <option>Master (Hi-Res Lossless)</option>
                                    <option>Hi-Fi (Lossless)</option>
                                    <option>High (320kbps AAC)</option>
                                    <option>Normal (128kbps AAC)</option>
                                </select>
                            </div>

                            {/* Exclusive Mode */}
                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <div className="font-medium">Exclusive Mode</div>
                                    <div className="text-xs text-[var(--text-secondary)]">Bypass system mixer (Bit-perfect)</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Account */}
                    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)]">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" /> Account
                        </h3>
                        <div className="text-sm text-[var(--text-secondary)] mb-4">
                            Manage your connected services and privacy settings.
                        </div>
                        <button
                            onClick={disconnectAll}
                            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                        >
                            Disconnect All Services
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SettingsView;
