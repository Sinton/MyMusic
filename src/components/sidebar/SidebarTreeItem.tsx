import React from 'react';
import type { Playlist } from '../../types';

interface SidebarTreeItemProps {
    playlist: Playlist;
    activeView: string;
    onNavigate: (view: string) => void;
    isNested?: boolean;
}

export const SidebarTreeItem: React.FC<SidebarTreeItemProps> = ({
    playlist,
    activeView,
    onNavigate,
    isNested = false
}) => {
    const isSelected = activeView === `Playlist:${playlist.id}`;
    const source = playlist.platform || 'local';

    return (
        <button
            onClick={() => playlist.id && onNavigate(`Playlist:${playlist.id}`)}
            title={playlist.title}
            className={`w-full flex items-center gap-3 pr-3 py-1.5 rounded-lg transition-colors group ${isNested ? 'pl-10 text-[11px]' : 'pl-8 text-xs'
                } ${isSelected
                    ? 'bg-[var(--glass-border)] text-[var(--text-main)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-highlight)]'
                }`}
        >
            <div className={`${isNested ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full flex-shrink-0 ${source === 'local' ? playlist.cover : 'bg-[var(--text-muted)] opacity-30 group-hover:opacity-60'
                }`} />
            <span className="truncate flex-1 text-left">{playlist.title}</span>
        </button>
    );
};
