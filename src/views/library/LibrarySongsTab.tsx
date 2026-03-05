import React from 'react';
import { useTranslation } from 'react-i18next';

interface LibrarySongsTabProps {
    isLoggedInNetease: boolean;
    isLoggedInQQ: boolean;
}

export const LibrarySongsTab: React.FC<LibrarySongsTabProps> = ({ isLoggedInNetease, isLoggedInQQ }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            {(!isLoggedInNetease && !isLoggedInQQ) ? (
                <div className="py-20 text-center text-[var(--text-muted)] border border-dashed border-[var(--glass-border)] rounded-2xl">
                    {t('auth.pleaseLogin', '请先登录以查看您的音乐库')}
                </div>
            ) : (
                <div className="py-20 text-center text-[var(--text-muted)] border border-dashed border-[var(--glass-border)] rounded-2xl">
                    {t('library.noLikedSongs')}
                </div>
            )}
        </div>
    );
};
