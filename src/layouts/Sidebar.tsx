import React from 'react';
import { Home, Music, Disc, Settings, Plus, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlatformStore } from '../stores/usePlatformStore';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { useQQStore } from '../stores/useQQStore';
import { useNeteaseUserPlaylists } from '../hooks/useNeteaseData';
import { useQQUserPlaylists } from '../hooks/useQQData';
import { PlatformBadge } from '../components';
import { getPlatformI18nKey } from '../lib/platformUtils';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import type { Platform, Playlist } from '../types';

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



const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onOpenAuth }) => {
    const { t } = useTranslation();
    const platforms = usePlatformStore((state) => state.platforms);
    const { userPlaylists: localPlaylists } = usePlaylistStore();
    const [showCreateModal, setShowCreateModal] = React.useState(false);

    // Remote Playlists
    const isLoggedInNetease = useNeteaseStore(state => state.isLoggedIn);
    const neteaseUser = useNeteaseStore(state => state.user);
    const isLoggedInQQ = useQQStore(state => state.isLoggedIn);

    const { playlists: neteaseRemotePlaylists } = useNeteaseUserPlaylists(neteaseUser?.userId || 0, {
        enabled: isLoggedInNetease
    });
    const { playlists: qqRemotePlaylists } = useQQUserPlaylists({
        enabled: isLoggedInQQ
    });

    // Combine all
    const allPlaylists = React.useMemo(() => {
        const combined: Playlist[] = [...localPlaylists];

        // NetEase: Show all but skip the very first one if it's the default "Liked" (handled separately or just show)
        // For sidebar, usually created playlists are best.
        if (isLoggedInNetease) {
            combined.push(...neteaseRemotePlaylists);
        }

        if (isLoggedInQQ) {
            combined.push(...qqRemotePlaylists);
        }

        return combined;
    }, [localPlaylists, neteaseRemotePlaylists, qqRemotePlaylists, isLoggedInNetease, isLoggedInQQ]);

    const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
        vibe: true,
        netease: true,
        netease_created: true,
        netease_collected: false,
        qq: true,
        qq_created: true,
        qq_collected: false,
    });

    const isGroupExpanded = (id: string) => expandedGroups[id] !== false;

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => ({ ...prev, [id]: !isGroupExpanded(id) }));
    };

    // Grouping
    const sections = React.useMemo(() => {
        const result = [];

        // Local
        if (localPlaylists.length > 0) {
            result.push({
                id: 'vibe',
                title: t('library.sections.local', '本地'),
                items: localPlaylists,
                type: 'simple' as const
            });
        }

        // NetEase
        if (isLoggedInNetease && neteaseRemotePlaylists.length > 0) {
            const liked = neteaseRemotePlaylists[0];
            const other = neteaseRemotePlaylists.slice(1);
            result.push({
                id: 'netease',
                title: '网易云音乐',
                type: 'platform' as const,
                liked,
                created: other.filter(p => !p.isSubscribed),
                collected: other.filter(p => p.isSubscribed)
            });
        }

        // QQ
        if (isLoggedInQQ && qqRemotePlaylists.length > 0) {
            const liked = qqRemotePlaylists[0];
            const other = qqRemotePlaylists.slice(1);
            result.push({
                id: 'qq',
                title: 'QQ 音乐',
                type: 'platform' as const,
                liked,
                created: other.filter(p => !p.isSubscribed),
                collected: other.filter(p => p.isSubscribed)
            });
        }

        return result;
    }, [localPlaylists, neteaseRemotePlaylists, qqRemotePlaylists, isLoggedInNetease, isLoggedInQQ, t]);

    const menuItems: MenuItem[] = [
        { id: 'Home', translationKey: 'sidebar.home', icon: Home },
        { id: 'Explore', translationKey: 'sidebar.explore', icon: Disc },
        { id: 'Library', translationKey: 'sidebar.library', icon: Music },
    ];

    return (
        <div className="glass-panel h-full flex flex-col" style={{ width: 'var(--sidebar-width)', flexShrink: 0 }}>
            {/* Draggable Top Region */}
            <div data-tauri-drag-region className="h-8 w-full flex-shrink-0" />

            {/* Menu */}
            <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar pt-2">
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
                    <div className="px-3 mb-2">
                        <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t('sidebar.myPlaylists')}</span>
                    </div>

                    <div className="space-y-1.5">
                        {sections.map((section) => {
                            const isSectionExpanded = isGroupExpanded(section.id);
                            const platformName = section.id === 'netease' ? 'NetEase' : section.id === 'qq' ? 'QQ Music' : 'Vibe';

                            const renderPlaylistItem = (pl: Playlist, isNested = false) => {
                                const isSelected = activeView === `Playlist:${pl.id}`;
                                const source = pl.source || 'vibe';
                                return (
                                    <button
                                        key={`${source}-${pl.id}`}
                                        onClick={() => pl.id && onNavigate(`Playlist:${pl.id}`)}
                                        title={pl.title}
                                        className={`w-full flex items-center gap-2 pr-3 py-1.5 rounded-lg transition-colors group ${isNested ? 'pl-10 text-[10px]' : 'pl-8 text-[11px]'} ${isSelected
                                            ? 'bg-[var(--glass-border)] text-[var(--text-main)] font-medium'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-highlight)]'
                                            }`}
                                    >
                                        <div className={`${isNested ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full flex-shrink-0 ${source === 'vibe' ? pl.cover : 'bg-[var(--text-muted)] opacity-30 group-hover:opacity-60'}`} />
                                        <span className="truncate flex-1 text-left">{pl.title}</span>
                                    </button>
                                );
                            };

                            const renderSubHeader = (groupId: string, label: string) => (
                                <button
                                    onClick={() => toggleGroup(`${section.id}_${groupId}`)}
                                    className="w-full flex items-center gap-1.5 pl-7 pr-3 py-1 text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors uppercase tracking-widest group mt-1"
                                >
                                    <ChevronRight className={`w-2.5 h-2.5 transition-transform ${isGroupExpanded(`${section.id}_${groupId}`) ? 'rotate-90' : ''}`} />
                                    {label}
                                </button>
                            );

                            return (
                                <div key={section.id} className="space-y-0.5">
                                    {/* Main Platform Header (LEVEL 1) */}
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => toggleGroup(section.id)}
                                            className="flex-1 flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors uppercase tracking-widest text-left"
                                        >
                                            <ChevronRight className={`w-3 h-3 transition-transform ${isSectionExpanded ? 'rotate-90' : ''}`} />
                                            <PlatformBadge name={platformName} size="xs" className="opacity-70 group-hover:opacity-100" />
                                            <span className="flex-1">{section.title}</span>
                                        </button>
                                        {section.id === 'vibe' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowCreateModal(true);
                                                }}
                                                className="mr-3 p-1 hover:bg-[var(--glass-highlight)] rounded-full transition-colors"
                                                title={t('playlist.create_new', '创建新歌单')}
                                            >
                                                <Plus className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--text-main)]" />
                                            </button>
                                        )}
                                    </div>

                                    {isSectionExpanded && (
                                        <div className="animate-slide-down space-y-0.5">
                                            {section.type === 'simple' ? (
                                                // Local Items (LEVEL 2)
                                                section.items.map(pl => renderPlaylistItem(pl, false))
                                            ) : (
                                                <>
                                                    {/* Liked Playlist (LEVEL 2) */}
                                                    {section.liked && renderPlaylistItem(section.liked, false)}

                                                    {/* Created Sub-section (LEVEL 2 Title) */}
                                                    {section.created && section.created.length > 0 && (
                                                        <>
                                                            {renderSubHeader('created', '创建的歌单')}
                                                            {/* Nested Items (LEVEL 3) */}
                                                            {isGroupExpanded(`${section.id}_created`) && section.created.map(pl => renderPlaylistItem(pl, true))}
                                                        </>
                                                    )}

                                                    {/* Collected Sub-section (LEVEL 2 Title) */}
                                                    {section.collected && section.collected.length > 0 && (
                                                        <>
                                                            {renderSubHeader('collected', '收藏的歌单')}
                                                            {/* Nested Items (LEVEL 3) */}
                                                            {isGroupExpanded(`${section.id}_collected`) && section.collected.map(pl => renderPlaylistItem(pl, true))}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Linked Accounts */}
            <div className="p-4 border-t border-[var(--glass-border)]">
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{t('sidebar.linked')}</h3>
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
                                        {t(`platforms.${getPlatformI18nKey(platform.name)}`)}
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

            <CreatePlaylistModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    );
};

export default Sidebar;
