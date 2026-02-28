import React from 'react';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlatformStore } from '../stores/usePlatformStore';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import { useSidebarData } from '../hooks/useSidebarData';
import type { Platform } from '../types';

// Sub-components
import { NavigationMenu } from '../components/sidebar/NavigationMenu';
import { PlaylistTree } from '../components/sidebar/PlaylistTree';
import { AccountSection } from '../components/sidebar/AccountSection';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
    onOpenAuth: (platform: Platform) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onOpenAuth }) => {
    const { t } = useTranslation();
    const platforms = usePlatformStore((state) => state.platforms);
    const [showCreateModal, setShowCreateModal] = React.useState(false);

    // Decoupled logic hook
    const { sections, isGroupExpanded, toggleGroup } = useSidebarData();

    return (
        <div className="glass-panel h-full flex flex-col" style={{ width: 'var(--sidebar-width)', flexShrink: 0 }}>
            {/* Draggable Top Region */}
            <div data-tauri-drag-region className="h-8 w-full flex-shrink-0" />

            {/* Menu - Fixed Top */}
            <NavigationMenu activeView={activeView} onNavigate={onNavigate} />

            {/* My Playlists Title - Fixed */}
            <div className="pl-5 pr-[21px] mt-6 mb-2 transition-opacity" style={{ scrollbarGutter: 'stable' }}>
                <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t('sidebar.myPlaylists')}</span>
            </div>

            {/* Platform Tree - Scrollable Center */}
            <PlaylistTree
                sections={sections}
                activeView={activeView}
                onNavigate={onNavigate}
                isGroupExpanded={isGroupExpanded}
                onToggleGroup={toggleGroup}
                onCreatePlaylist={() => setShowCreateModal(true)}
            />

            {/* Linked Accounts */}
            <AccountSection platforms={platforms} onOpenAuth={onOpenAuth} />

            {/* Settings (Bottom) */}
            <div className="p-4 border-t border-[var(--glass-border)]">
                <button
                    onClick={() => onNavigate('Settings')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeView === 'Settings'
                        ? 'bg-[var(--glass-border)] text-[var(--text-main)] font-medium'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-highlight)]'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    {t('sidebar.settings')}
                </button>
            </div>

            <CreatePlaylistModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    );
};

export default Sidebar;
