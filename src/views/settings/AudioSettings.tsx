import React from 'react';
import { Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Dropdown } from '../../components/index';

const AudioSettings: React.FC = () => {
    const { t } = useTranslation();
    const {
        outputDevice, setOutputDevice,
        streamingQuality, setStreamingQuality,
        exclusiveMode, toggleExclusiveMode,
    } = useSettingsStore();

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
    );
};

export default AudioSettings;
