import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { PlatformBadge } from '..';
import { useTranslation } from 'react-i18next';

interface SidebarPlatformHeaderProps {
    id: string;
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    onCreateClick?: () => void;
}

export const SidebarPlatformHeader: React.FC<SidebarPlatformHeaderProps> = ({
    id,
    title,
    isExpanded,
    onToggle,
    onCreateClick
}) => {
    const { t } = useTranslation();
    const platformName = id === 'netease' ? 'NetEase' : id === 'qq' ? 'QQ Music' : 'Vibe';

    return (
        <div className="flex items-center">
            <button
                onClick={onToggle}
                className="flex-1 flex items-center gap-2 px-3 py-1.5 text-[13px] font-bold text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors uppercase tracking-widest text-left"
            >
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                <PlatformBadge name={platformName} size="xs" className="opacity-70 group-hover:opacity-100" />
                <span className="flex-1">{title}</span>
            </button>
            {id === 'vibe' && onCreateClick && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCreateClick();
                    }}
                    className="mr-3 p-1 hover:bg-[var(--glass-highlight)] rounded-full transition-colors"
                    title={t('playlist.create_new', '创建新歌单')}
                >
                    <Plus className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--text-main)]" />
                </button>
            )}
        </div>
    );
};
