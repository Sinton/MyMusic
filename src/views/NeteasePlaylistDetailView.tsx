import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Play, Music, Cloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton, ListSkeleton } from '../components/common/Skeleton';
import SongRow from '../components/SongRow';
import { useNeteasePlaylistDetail } from '../hooks/useNeteaseData';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { Track, Song, AudioSource } from '../types';

interface NeteasePlaylistDetailViewProps {
    playlistId: number;
}

const NeteasePlaylistDetailView: React.FC<NeteasePlaylistDetailViewProps> = ({ playlistId }) => {
    const { t } = useTranslation();
    const { playlist: playlistData, isLoading } = useNeteasePlaylistDetail(playlistId);
    const { setTrack, play, setQueue } = usePlayerStore();

    const playlist = playlistData;
    const songs = playlistData?.songs || [];

    // Find the scroll container (which is rendered in MainView.tsx with class "main-scroller")
    const scrollRef = useRef<Element | null>(null);
    if (typeof document !== 'undefined' && !scrollRef.current) {
        scrollRef.current = document.querySelector('.main-scroller');
    }

    const rowVirtualizer = useVirtualizer({
        count: songs.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 64, // Estimated height of a SongRow (roughly 56px + 8px gap)
        overscan: 10, // Render 10 items outside of viewport to prevent white flashes
    });

    const handlePlayAll = () => {
        if (songs.length > 0) {
            const tracks: Track[] = songs.map((song: Song) => ({
                id: song.id,
                title: song.title,
                artist: song.artist,
                artistId: song.artistId,
                album: song.album,
                albumId: song.albumId,
                duration: song.duration,
                currentTime: '0:00',
                source: song.bestSource,
                quality: song.sources[0]?.qualityLabel || 'Standard',
                cover: song.cover || playlist?.cover || '',
            }));

            setQueue(tracks);
            setTrack(tracks[0]);
            play();
        }
    };

    const handlePlaySong = (song: Song, source?: AudioSource) => {
        if (songs.length > 0) {
            const selectedTrack: Track = {
                id: song.id,
                title: song.title,
                artist: song.artist,
                artistId: song.artistId,
                album: song.album,
                albumId: song.albumId,
                duration: song.duration,
                currentTime: '0:00',
                source: source?.platform || song.bestSource,
                quality: source?.qualityLabel || song.sources[0]?.qualityLabel || 'Standard',
                cover: song.cover || playlist?.cover || '',
            };

            const currentQueue = usePlayerStore.getState().queue;
            if (!currentQueue.find(t => t.id === selectedTrack.id)) {
                setQueue([...currentQueue, selectedTrack]);
            }

            setTrack(selectedTrack);
            play();
        }
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in pt-4">
                <div className="flex flex-col md:flex-row gap-8 items-end mb-8 mt-6">
                    <Skeleton className="w-48 h-48 md:w-60 md:h-60 rounded-2xl shrink-0" />
                    <div className="flex-1 w-full space-y-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-16 w-3/4 md:w-1/2 rounded-lg" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <div className="flex gap-4 mb-8">
                    <Skeleton className="h-12 w-32 rounded-full" />
                </div>
                <ListSkeleton rows={8} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Playlist Header */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-8 mt-10">
                <div className="w-48 h-48 md:w-60 md:h-60 rounded-2xl shadow-2xl overflow-hidden relative group flex-shrink-0">
                    {playlist?.cover ? (
                        <img
                            src={playlist.cover}
                            alt={playlist.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-500/30 to-pink-500/30 flex items-center justify-center">
                            <Music className="w-20 h-20 text-white/20" />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                        <Cloud className="w-3 h-3 text-red-500" />
                        {t('playlist.neteasePlaylist', '网易云歌单')}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-[var(--text-main)] tracking-tight leading-none mb-6">
                        {playlist?.title || '歌单'}
                    </h1>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-[var(--text-main)]">{playlist?.creator || ''}</span>
                        <span className="text-[var(--text-muted)]">•</span>
                        <span className="text-[var(--text-secondary)]">{songs.length} {t('playlist.songs', '首')}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 mb-8">
                <button
                    onClick={handlePlayAll}
                    disabled={songs.length === 0}
                    className="flex items-center gap-2 px-8 py-3 bg-[var(--accent-color)] text-white rounded-full font-bold hover:scale-105 transition-all shadow-lg shadow-[var(--accent-color)]/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                    <Play className="w-5 h-5 fill-current" />
                    {t('playlist.playAll', '播放全部')}
                </button>
            </div>

            {/* Songs List */}
            {songs.length > 0 ? (
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative'
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                        const song = songs[virtualItem.index];
                        return (
                            <div
                                key={virtualItem.key}
                                data-index={virtualItem.index}
                                ref={rowVirtualizer.measureElement}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualItem.start}px)`,
                                    paddingBottom: '8px' // Acts as the former space-y-2 gap
                                }}
                            >
                                <SongRow song={song} onPlay={handlePlaySong} />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-48 flex flex-col items-center justify-center text-[var(--text-muted)] space-y-4">
                    <Music className="w-16 h-16 opacity-20" />
                    <p>{t('playlist.empty', '暂无歌曲')}</p>
                </div>
            )}
        </div>
    );
};

export default NeteasePlaylistDetailView;
