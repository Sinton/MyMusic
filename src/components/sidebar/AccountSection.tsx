import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformBadge } from '..';
import { getPlatformI18nKey } from '../../lib/platformUtils';
import type { Platform } from '../../types';

interface AccountSectionProps {
    platforms: Platform[];
    onOpenAuth: (platform: Platform) => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ platforms, onOpenAuth }) => {
    const { t } = useTranslation();

    return (
        <div className="p-4 border-t border-[var(--glass-border)]" style={{ scrollbarGutter: 'stable' }}>
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{t('sidebar.linked')}</h3>
            <div className="space-y-3">
                {platforms.map((platform) => (
                    <div
                        key={platform.name}
                        onClick={() => onOpenAuth(platform)}
                        className="flex items-center gap-3 group cursor-pointer hover:bg-[var(--glass-highlight)] p-2 rounded-lg transition-colors"
                    >
                        <PlatformBadge
                            name={platform.name}
                            color={platform.color}
                            connected={platform.connected}
                            size="sm"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${platform.connected ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                                    {t(`platforms.${getPlatformI18nKey(platform.name)}`)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
