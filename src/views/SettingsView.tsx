import React from 'react';
import { Settings, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlatformStore } from '../stores/usePlatformStore';
import { Modal } from '../components/common/Modal';
import AppearanceSettings from './settings/AppearanceSettings';
import GeneralSettings from './settings/GeneralSettings';
import AudioSettings from './settings/AudioSettings';
import AboutSection from './settings/AboutSection';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { useQQStore } from '../stores/useQQStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { usePlaylistStore } from '../stores/usePlaylistStore';

const SettingsView: React.FC = () => {
    const { t } = useTranslation();
    const disconnectPlatform = usePlatformStore((state) => state.disconnectPlatform);
    const neteaseStore = useNeteaseStore();
    const qqStore = useQQStore();
    const playerStore = usePlayerStore();
    const playlistStore = usePlaylistStore();
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [confirmInput, setConfirmInput] = React.useState('');

    const handleDisconnectAll = () => {
        // ... existence logic ...
        neteaseStore.logout();
        qqStore.logout();
        playerStore.clearQueue();
        disconnectPlatform('NetEase Cloud');
        disconnectPlatform('QQ Music');
        disconnectPlatform('Qishui Music');
        window.location.reload();
    };

    const closeConfirm = () => {
        setShowConfirm(false);
        setConfirmInput('');
    };

    const keyword = t('settings.dangerZone.confirmKeyword');
    const isMatched = confirmInput === keyword;

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
                                onClick={() => setShowConfirm(true)}
                                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-all font-medium"
                            >
                                {t('settings.dangerZone.button')}
                            </button>
                        </div>
                    </div>

                    <Modal
                        isOpen={showConfirm}
                        onClose={closeConfirm}
                        title={t('settings.dangerZone.confirmTitle')}
                    >
                        <div className="space-y-6">
                            <div
                                className="text-[var(--text-secondary)] leading-relaxed text-sm animate-stagger-1"
                                dangerouslySetInnerHTML={{
                                    __html: t('settings.dangerZone.confirmDesc', { keyword })
                                }}
                            />

                            <input
                                type="text"
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                                placeholder={t('settings.dangerZone.confirmInputPlaceholder', { keyword })}
                                className="w-full bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium text-center animate-stagger-2"
                                autoFocus
                            />

                            <div className="flex flex-col gap-3 animate-stagger-3">
                                <button
                                    onClick={handleDisconnectAll}
                                    disabled={!isMatched}
                                    className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {t('settings.dangerZone.button')}
                                </button>
                                <button
                                    onClick={closeConfirm}
                                    className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </section>
        </div>
    );
};

export default SettingsView;
