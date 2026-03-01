import { useState } from 'react';
import { Play, Disc, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SongRow } from '../components';
import { ListSkeleton } from '../components/common/Skeleton';
import { ImmersiveHeader } from '../components/common/ImmersiveHeader';
import ShareButton from '../components/common/ShareButton';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { Album, Song, Track } from '../types';

interface AlbumDetailViewProps {
    album: Album;
    onBack: () => void;
    onNavigate?: (view: string) => void;
    /** If provided, use these songs instead of fetching from local mock data */
    externalSongs?: Song[];
    externalLoading?: boolean;
}

const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ album, onNavigate, externalSongs, externalLoading }) => {
    const { t } = useTranslation();
    const { setTrack, play, isPlaying, currentTrack, setQueue } = usePlayerStore();
    const albumSongs = externalSongs ?? [];
    const isLoading = externalLoading ?? false;
    const [isLiked, setIsLiked] = useState(false);

    const isCurrentAlbum = currentTrack?.albumId === album.id;

    const handlePlayAll = () => {
        if (albumSongs.length > 0) {
            const tracks: Track[] = albumSongs.map(song => ({
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
            }));

            setQueue(tracks);
            setTrack(tracks[0]);
            play();
        }
    };

    // Calculate total duration
    const getTotalDuration = () => {
        let totalSeconds = 0;
        albumSongs.forEach(song => {
            const [mins, secs] = song.duration.split(':').map(Number);
            totalSeconds += (mins * 60) + (secs || 0);
        });
        const totalMins = Math.floor(totalSeconds / 60);
        return `${totalMins} ${t('common.min')}`;
    };

    const getAlbumTypeLabel = () => {
        if (albumSongs.length === 1) return t('album.single');
        if (albumSongs.length <= 6) return t('album.ep');
        return t('album.label');
    };

    return (
        <div className="animate-fade-in pb-20 relative">
            <ImmersiveHeader backgroundImage={album.cover}>
                <div className="absolute bottom-24 left-12 right-12 flex flex-col md:flex-row gap-16 items-end">
                    {/* Cover Art - Premium Vinyl Design */}
                    <div className="relative w-64 h-64 md:w-72 md:h-72 flex-shrink-0 z-20">
                        {/* The Record (Vinyl) - Corrected Shape and Rotation */}
                        <div className={`absolute left-1/4 top-2 bottom-2 aspect-square bg-[#030303] rounded-full shadow-[0_0_60px_rgba(0,0,0,0.5)] dark:shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 flex items-center justify-center border-[10px] border-[#111] dark:border-[#161616] group-hover:left-1/2 ${isCurrentAlbum && isPlaying ? 'animate-spin-slow-variable' : ''}`}>
                            {/* Record Grooves - More detailed */}
                            <div className="absolute inset-0 rounded-full border border-white/10 opacity-50 ring-2 ring-white/5 ring-inset" />
                            <div className="absolute inset-4 rounded-full border border-white/5 opacity-30" />
                            <div className="absolute inset-8 rounded-full border border-white/5 opacity-25" />
                            <div className="absolute inset-12 rounded-full border border-white/5 opacity-20" />

                            {/* Record Center Label */}
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#161616] shadow-2xl relative">
                                <img src={album.cover} className="w-full h-full object-cover scale-110" alt="Label" />
                                <div className="absolute inset-0 bg-black/10" />
                            </div>

                            {/* Center Hole */}
                            <div className="absolute w-3 h-3 bg-[var(--bg-color)] rounded-full shadow-inner z-10 border border-white/10" />
                        </div>

                        {/* The Sleeve */}
                        <div className="relative w-full h-full rounded-xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] overflow-hidden z-10 transition-all duration-500 group-hover:-translate-x-6 group-hover:rotate-[-2deg]">
                            {album.cover.startsWith('bg-') ? (
                                <div className={`w-full h-full ${album.cover} flex items-center justify-center`}>
                                    <Disc className="w-32 h-32 text-white/20" />
                                </div>
                            ) : (
                                <img
                                    src={album.cover}
                                    alt={album.title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {/* Sleeve Lighting/Texture */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 opacity-40 transition-opacity group-hover:opacity-20" />
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-xl" />
                        </div>
                    </div>

                    {/* Metadata Info - Optimized for long titles */}
                    <div className="flex-1 flex flex-col items-start z-10 mb-2 md:pl-12 lg:pl-20 max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1 rounded-full bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-[0.25em] shadow-lg shadow-[var(--accent-color)]/20">
                                {getAlbumTypeLabel()}
                            </span>
                            <span className="text-sm font-bold text-[var(--text-secondary)] tracking-wider">
                                {album.year}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 text-[var(--text-main)] tracking-tighter leading-[0.9] drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] line-clamp-3 overflow-hidden">
                            {album.title}
                        </h1>

                        <div className="flex items-center flex-wrap gap-x-8 gap-y-4">
                            {/* Artist Identifier */}
                            <button
                                onClick={() => {
                                    if (onNavigate) {
                                        const artistIdParam = album.artistId ? `:${album.artistId}` : '';
                                        onNavigate(`Artist:${album.artist}${artistIdParam}`);
                                    }
                                }}
                                className="flex items-center gap-4 group/artist"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 shadow-xl transition-all group-hover/artist:ring-[var(--accent-color)] group-hover/artist:scale-110 bg-[var(--glass-highlight)]">
                                    <img
                                        src={album.artistAvatar || album.cover}
                                        className={`w-full h-full object-cover transition-all duration-500 ${!album.artistAvatar ? 'blur-[2px] opacity-80' : ''}`}
                                        alt="Artist"
                                    />
                                </div>
                                <span className="text-xl font-black text-[var(--text-main)] hover:text-[var(--accent-color)] transition-all underline-offset-8 decoration-2 decoration-transparent hover:decoration-[var(--accent-color)]">
                                    {album.artist}
                                </span>
                            </button>

                            <div className="flex items-center gap-6 text-sm font-extrabold text-[var(--text-secondary)]">
                                <span className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" />
                                    {albumSongs.length} {t('album.songs')}
                                </span>
                                <span className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" />
                                    {getTotalDuration()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </ImmersiveHeader>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-4 px-8 mb-10">
                <button
                    onClick={handlePlayAll}
                    disabled={albumSongs.length === 0}
                    className="flex items-center gap-2 px-8 py-3 bg-[var(--accent-color)] text-white rounded-full font-bold hover:scale-105 transition-all shadow-lg shadow-[var(--accent-color)]/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                    <Play className="w-5 h-5 fill-current" />
                    {t('album.playAlbum')}
                </button>

                <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-3 border rounded-full transition-all ${isLiked
                        ? 'bg-pink-500/10 border-pink-500/20 text-pink-500'
                        : 'bg-[var(--glass-highlight)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--glass-border)] hover:text-[var(--text-main)]'
                        }`}
                >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                <ShareButton text={t('fullPlayer.options.share')} />
            </div>

            {/* Tracklist */}
            <div className="space-y-1 px-4 md:px-8">


                {isLoading ? (
                    <ListSkeleton rows={8} />
                ) : (
                    !albumSongs || albumSongs.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
                            <Disc className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium text-sm">{t('album.noTracks')}</p>
                        </div>
                    ) : (
                        albumSongs.map((song) => (
                            <div key={song.id} className="group relative">
                                <SongRow
                                    song={song}
                                />
                            </div>
                        ))
                    )
                )}
            </div>

            {/* Copyright / Footer Info */}
            <div className="mt-12 px-8 text-xs text-[var(--text-muted)] border-t border-[var(--glass-border)] pt-8">
                <p className="mb-1">{t('album.released')}: {album.year}</p>
                <p>℗ {album.year} {album.artist} • Distributed by Vibe Music</p>
            </div>
        </div>
    );
};

export default AlbumDetailView;
