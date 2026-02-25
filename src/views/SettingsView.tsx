import React from 'react';
import { Settings, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlatformStore } from '../stores/usePlatformStore';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import GeneralSettings from '../components/settings/GeneralSettings';
import AudioSettings from '../components/settings/AudioSettings';
import AboutSection from '../components/settings/AboutSection';

const SettingsView: React.FC = () => {
    const { t } = useTranslation();
    const disconnectAll = usePlatformStore((state) => state.disconnectAll);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-8 pb-32">
            <section>
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Settings className="w-8 h-8" /> {t('settings.title')}
                </h2>

                <div className="grid gap-6">
                    <AppearanceSettings />
                    <GeneralSettings />
                    <AudioSettings />
                    <AboutSection />

                    {/* Danger Zone */}
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

export default SettingsView;
