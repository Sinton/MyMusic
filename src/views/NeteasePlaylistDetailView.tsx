import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaylistShell } from '../components';
import { PlatformBadge } from '../components';
import { useNeteasePlaylistDetail } from '../hooks/useNeteaseData';
import { usePlayerStore } from '../stores/usePlayerStore';
import { songToTrack } from '../lib/trackUtils';

interface NeteasePlaylistDetailViewProps {
    playlistId: number;
}

const NeteasePlaylistDetailView: React.FC<NeteasePlaylistDetailViewProps> = ({ playlistId }) => {
    const { t } = useTranslation();
    const { playlist: playlistData, isLoading } = useNeteasePlaylistDetail(playlistId);
    const { setTrack, play, setQueue } = usePlayerStore();

    const playlist = playlistData;
    const songs = playlistData?.songs || [];
    const coverFallback = playlist?.cover || '';

    const handlePlayAll = () => {
        if (songs.length > 0) {
            const tracks = songs.map(song => songToTrack(song, undefined, { cover: song.cover || coverFallback }));
            setQueue(tracks);
            setTrack(tracks[0]);
            play();
        }
    };

    return (
        <PlaylistShell
            isLoading={isLoading}
            title={playlist?.title || t('playlist.titleCol', '标题')}
            cover={coverFallback}
            creator={playlist?.creator || ''}
            songs={songs}
            HeaderIcon={() => (
                <PlatformBadge
                    name="NetEase"
                    size="xs"
                    className="w-3.5 h-3.5 rounded-sm shadow-[0_1px_4px_rgba(236,65,65,0.3)]"
                />
            )}
            headerTagText={t('playlist.neteasePlaylist', '网易云歌单')}
            headerTagColorClass="text-[var(--text-muted)]"
            isEditable={false}
            onPlayAll={handlePlayAll}
        />
    );
};

export default NeteasePlaylistDetailView;
