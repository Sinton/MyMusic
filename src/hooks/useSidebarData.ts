import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformStore } from '../stores/usePlatformStore';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { useNeteaseStore } from '../stores/useNeteaseStore';
import { useQQStore } from '../stores/useQQStore';
import { useNeteaseUserPlaylists } from './useNeteaseData';
import { useQQUserPlaylists } from './useQQData';
import type { Playlist } from '../types';

export interface SidebarSection {
    id: string;
    title: string;
    type: 'simple' | 'platform';
    items?: Playlist[];
    liked?: Playlist;
    created?: Playlist[];
    collected?: Playlist[];
}

export const useSidebarData = () => {
    const { t } = useTranslation();
    const { userPlaylists: localPlaylists } = usePlaylistStore();

    const isLoggedInNetease = useNeteaseStore(state => state.isLoggedIn);
    const neteaseUser = useNeteaseStore(state => state.user);
    const isLoggedInQQ = useQQStore(state => state.isLoggedIn);

    const { playlists: neteaseRemotePlaylists } = useNeteaseUserPlaylists(neteaseUser?.userId || 0, {
        enabled: isLoggedInNetease
    });
    const { playlists: qqRemotePlaylists } = useQQUserPlaylists({
        enabled: isLoggedInQQ
    });

    const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
        vibe: true,
        netease: true,
        netease_created: true,
        netease_collected: false,
        qq: true,
        qq_created: true,
        qq_collected: false,
    });

    const isGroupExpanded = React.useCallback((id: string) => expandedGroups[id] !== false, [expandedGroups]);

    const toggleGroup = React.useCallback((id: string) => {
        setExpandedGroups(prev => ({ ...prev, [id]: !isGroupExpanded(id) }));
    }, [isGroupExpanded]);

    const sections = React.useMemo(() => {
        const result: SidebarSection[] = [];

        // Local
        result.push({
            id: 'vibe',
            title: t('library.sections.local', '本地'),
            items: localPlaylists,
            type: 'simple'
        });

        // NetEase
        if (isLoggedInNetease && neteaseRemotePlaylists.length > 0) {
            const liked = neteaseRemotePlaylists[0];
            const other = neteaseRemotePlaylists.slice(1);
            result.push({
                id: 'netease',
                title: '网易云音乐',
                type: 'platform',
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
                type: 'platform',
                liked,
                created: other.filter(p => !p.isSubscribed),
                collected: other.filter(p => p.isSubscribed)
            });
        }

        return result;
    }, [localPlaylists, neteaseRemotePlaylists, qqRemotePlaylists, isLoggedInNetease, isLoggedInQQ, t]);

    return {
        sections,
        isGroupExpanded,
        toggleGroup
    };
};
