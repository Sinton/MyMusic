import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import type { Artist } from '../../types';

interface ArtistAboutTabProps {
    artistData: Artist;
}

export const ArtistAboutTab: React.FC<ArtistAboutTabProps> = ({ artistData }) => {
    const { t } = useTranslation();

    return (
        <section className="animate-fade-in w-full pt-8">
            <h2 className="text-xl font-bold mb-10 flex items-center gap-4 text-[var(--text-main)] tracking-tight">
                <Info className="w-6 h-6 text-[var(--accent-color)]" />
                {t('artist.about')}
            </h2>

            <div className="relative pl-12 border-l-2 border-[var(--accent-color)]/20 ml-2">
                <div className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed opacity-90 mb-10 max-w-4xl whitespace-pre-wrap">
                    {artistData.bio}
                </div>
            </div>
        </section>
    );
};
