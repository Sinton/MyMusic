import React from 'react';
import { Home, Music, Disc, Settings, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlatformStore } from '../stores/usePlatformStore';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { PlatformBadge, Modal } from '../components';
import type { Platform } from '../types';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
    onOpenAuth: (platform: Platform) => void;
}

interface MenuItem {
    id: string;
    translationKey: string;
    icon: React.FC<{ className?: string }>;
}

const getPlatformKey = (name: string): string => {
    if (name.includes('NetEase')) return 'netease';
    if (name.includes('QQ')) return 'qq';
    if (name.includes('Soda')) return 'soda';
    return name;
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onOpenAuth }) => {
    const { t } = useTranslation();
    const platforms = usePlatformStore((state) => state.platforms);
    const { userPlaylists, createPlaylist } = usePlaylistStore();
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [newPlaylistName, setNewPlaylistName] = React.useState('');

    const menuItems: MenuItem[] = [
        { id: 'Home', translationKey: 'sidebar.home', icon: Home },
        { id: 'Explore', translationKey: 'sidebar.explore', icon: Disc },
        { id: 'Library', translationKey: 'sidebar.library', icon: Music },
    ];

    const handleCreatePlaylist = () => {
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName.trim());
            setNewPlaylistName('');
            setShowCreateModal(false);
        }
    };

    return (
        <div className="glass-panel h-full flex flex-col" style={{ width: 'var(--sidebar-width)', flexShrink: 0 }}>
            {/* Traffic Lights Area */}
            <div className="h-12 flex items-center px-4 gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeView === item.id
                            ? 'bg-[var(--glass-border)] text-[var(--text-main)] font-medium'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-highlight)]'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {t(item.translationKey)}
                    </button>
                ))}

                {/* Playlist Section */}
                <div className="pt-4 pb-2">
                    <div className="flex items-center justify-between px-3 mb-2">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t('sidebar.myPlaylists')}</span>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="p-1 hover:bg-[var(--glass-highlight)] rounded-full transition-colors group"
                        >
                            <Plus className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
                        </button>
                    </div>
                    {userPlaylists.map((pl) => (
                        <button
                            key={pl.id}
                            onClick={() => onNavigate(`Playlist:${pl.id}`)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${activeView === `Playlist:${pl.id}`
                                ? 'bg-[var(--glass-border)] text-[var(--text-main)] font-medium'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-highlight)]'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${pl.cover} group-hover:scale-125 transition-transform ${activeView === `Playlist:${pl.id}` ? 'scale-125' : ''}`}></div>
                            <span className="truncate">{pl.title}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Linked Accounts */}
            <div className="p-4 border-t border-[var(--glass-border)]">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{t('sidebar.linked')}</h3>
                <div className="space-y-3">
                    {platforms.map((platform: Platform) => (
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
                                        {t(`platforms.${getPlatformKey(platform.name)}`)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={t('sidebar.createPlaylist')}
            >
                <div className="space-y-4">
                    <div className="space-y-2 animate-stagger-1">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('sidebar.playlistName')}</label>
                        <input
                            autoFocus
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                            placeholder="e.g. My Awesome Mix"
                            className="w-full bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={handleCreatePlaylist}
                        disabled={!newPlaylistName.trim()}
                        className="w-full py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--accent-color)]/20 disabled:opacity-50 disabled:hover:scale-100 animate-stagger-2"
                    >
                        {t('sidebar.createPlaylist')}
                    </button>
                    <button
                        onClick={() => setShowCreateModal(false)}
                        className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors animate-stagger-3"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Sidebar;
