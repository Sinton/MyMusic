import React from 'react';
import { Home, Music, Disc, Settings, Plus } from 'lucide-react';
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
    name: string;
    icon: React.FC<{ className?: string }>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onOpenAuth }) => {
    const platforms = usePlatformStore((state) => state.platforms);
    const { userPlaylists, createPlaylist } = usePlaylistStore();
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [newPlaylistName, setNewPlaylistName] = React.useState('');

    const menuItems: MenuItem[] = [
        { name: 'Home', icon: Home },
        { name: 'Explore', icon: Disc },
        { name: 'Library', icon: Music },
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
                        key={item.name}
                        onClick={() => onNavigate(item.name)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeView === item.name
                            ? 'bg-[rgba(255,255,255,0.1)] text-[var(--text-main)] font-medium'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[rgba(255,255,255,0.05)]'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </button>
                ))}

                {/* Playlist Section */}
                <div className="pt-4 pb-2">
                    <div className="flex items-center justify-between px-3 mb-2">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">My Playlists</span>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors group"
                        >
                            <Plus className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-white" />
                        </button>
                    </div>
                    {userPlaylists.map((pl) => (
                        <button
                            key={pl.id}
                            onClick={() => onNavigate(`Playlist:${pl.id}`)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${activeView === `Playlist:${pl.id}`
                                ? 'bg-[rgba(255,255,255,0.1)] text-[var(--text-main)] font-medium'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[rgba(255,255,255,0.05)]'
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
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Linked</h3>
                <div className="space-y-3">
                    {platforms.map((platform: Platform) => (
                        <div
                            key={platform.name}
                            onClick={() => onOpenAuth(platform)}
                            className="flex items-center gap-3 group cursor-pointer hover:bg-[rgba(255,255,255,0.05)] p-2 rounded-lg transition-colors"
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
                                        {platform.name}
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
                        ? 'bg-[rgba(255,255,255,0.1)] text-[var(--text-main)] font-medium'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[rgba(255,255,255,0.05)]'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    Settings
                </button>
            </div>

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Playlist"
            >
                <div className="space-y-4">
                    <div className="space-y-2 animate-stagger-1">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Playlist Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                            placeholder="e.g. My Awesome Mix"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={handleCreatePlaylist}
                        disabled={!newPlaylistName.trim()}
                        className="w-full py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--accent-color)]/20 disabled:opacity-50 disabled:hover:scale-100 animate-stagger-2"
                    >
                        Create Playlist
                    </button>
                    <button
                        onClick={() => setShowCreateModal(false)}
                        className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors animate-stagger-3"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Sidebar;
