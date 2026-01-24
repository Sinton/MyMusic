import { useState } from 'react';
import { Play, Share2, Check, Disc, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SongRow } from '../components';
import { ImmersiveHeader } from '../components/common/ImmersiveHeader';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useSongs } from '../hooks/useData';
import type { Album, Song } from '../types';

interface AlbumDetailViewProps {
    album: Album;
    onBack: () => void;
    onNavigate?: (view: string) => void;
}

const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ album, onNavigate }) => {
    const { t } = useTranslation();
    const { setTrack, play, isPlaying, currentTrack } = usePlayerStore();
    const { songs: allSongs } = useSongs();
    const [isShared, setIsShared] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const isCurrentAlbum = currentTrack?.albumId === album.id;

    // Dynamic song fetching: filter songs that belong to this album
    const albumSongs: Song[] = allSongs.filter((s: Song) => s.album === album.title);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        // Reset after 3 seconds
        setTimeout(() => setIsShared(false), 3000);
    };

    const handlePlayAll = () => {
        if (albumSongs.length > 0) {
            const firstSong = albumSongs[0];
            const track: any = {
                id: firstSong.id,
                title: firstSong.title,
                artist: firstSong.artist,
                artistId: firstSong.artistId,
                album: firstSong.album,
                albumId: firstSong.albumId,
                duration: firstSong.duration,
                currentTime: '0:00',
                source: firstSong.bestSource,
                quality: firstSong.sources[0]?.qualityLabel || 'Standard',
            };
            setTrack(track);
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
        return `${totalMins} min`;
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

                    {/* Metadata Info - Adjusted margin to prevent overlap */}
                    <div className="flex-1 flex flex-col items-start z-10 mb-2 md:pl-12 lg:pl-20">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1 rounded-full bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-[0.25em] shadow-lg shadow-[var(--accent-color)]/20">
                                {getAlbumTypeLabel()}
                            </span>
                            <span className="text-sm font-bold text-[var(--text-secondary)] tracking-wider">{album.year}</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black mb-8 text-[var(--text-main)] tracking-tighter leading-[0.85] drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                            {album.title}
                        </h1>

                        <div className="flex items-center flex-wrap gap-x-8 gap-y-4">
                            {/* Artist Identifier */}
                            <button
                                onClick={() => onNavigate && onNavigate(`Artist:${album.artist}`)}
                                className="flex items-center gap-4 group/artist"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 shadow-xl transition-all group-hover/artist:ring-[var(--accent-color)] group-hover/artist:scale-110">
                                    <img src={album.cover} className="w-full h-full object-cover blur-[2px] opacity-80" alt="Artist" />
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
                    {t('album.playAll')}
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

                <button
                    onClick={handleShare}
                    className={`px-5 py-3 border rounded-full transition-all flex items-center gap-3 ${isShared
                        ? 'bg-green-500 text-white border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                        : 'bg-[var(--glass-highlight)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--glass-border)] hover:text-[var(--text-main)] hover:scale-105'
                        }`}
                >
                    {isShared ? (
                        <>
                            <Check className="w-5 h-5 animate-[modal-content-in_0.3s_ease-out]" />
                            <span className="text-sm font-bold animate-[content-slide-up_0.3s_ease-out]">{t('playlist.linkCopied')}</span>
                        </>
                    ) : (
                        <>
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm font-bold">{t('fullPlayer.options.share')}</span>
                        </>
                    )}
                </button>
            </div>

            {/* Tracklist */}
            <div className="space-y-1 px-4 md:px-8">
                <div className="flex items-center px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--glass-border)] mb-2 opacity-50">
                    <div className="w-8">#</div>
                    <div className="flex-1">{t('playlist.titleCol')}</div>
                    <div className="w-20 text-right">{t('playlist.timeCol')}</div>
                </div>

                {!albumSongs || albumSongs.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
                        <Disc className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium text-sm">No tracks available</p>
                    </div>
                ) : (
                    albumSongs.map((song, idx) => (
                        <div key={song.id} className="group relative">
                            <SongRow
                                song={song}
                            />
                        </div>
                    ))
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
