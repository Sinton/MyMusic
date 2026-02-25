import React from 'react';
import { Info, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoBgImg from '../../assets/logo_bg.png';

const AboutSection: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-main)]">
                <Info className="w-5 h-5 text-gray-400" /> {t('settings.about.title')}
            </h3>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
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
                {(['terms', 'privacy', 'licenses', 'github'] as const).map((key) => (
                    <button
                        key={key}
                        className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors text-left group"
                    >
                        <span>{t(`settings.about.${key}`)}</span>
                        <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AboutSection;
