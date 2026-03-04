import React, { useState } from 'react';
import { Heart, ListMusic, User, Disc, Share2, Clock, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPlatformI18nKey } from '../../lib/platformUtils';
import { useTrackActions } from '../../hooks/useTrackActions';
import Drawer from '../common/Drawer';
import type { Track, Playlist, Song } from '../../types';

interface OptionsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentTrack: Track;
    userPlaylists: Playlist[];
    onAddToPlaylist: (playlistId: string | number, song: Song) => void;
    onNavigate?: (view: string) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
    isOpen,
    onClose,
    currentTrack,
    userPlaylists,
    onAddToPlaylist,
    onNavigate
}) => {
    const { t } = useTranslation();
    const [menuView, setMenuView] = useState<'main' | 'playlist' | 'sleep'>('main');
    const [sleepTimer, setSleepTimer] = useState<number | null>(null);

    const {
        handleViewArtist,
        handleViewAlbum,
        handleShare,
        trackToSong,
        isCopied,
    } = useTrackActions(currentTrack, { onNavigate, onClose });

    const handleAddToPlaylist = (playlistId: string | number) => {
        const song = trackToSong();
        if (song) {
            onAddToPlaylist(playlistId, song);
        }
        onClose();
        setMenuView('main');
    };

    const handleComingSoon = (_feature: string) => {
        // Placeholder for future implementation
    };

    const handleSetSleepTimer = (minutes: number | null) => {
        setSleepTimer(minutes);
        setTimeout(() => setMenuView('main'), 200);
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={t('fullPlayer.options.title')}
            widthClass="lg:w-[320px]"
            zIndex="z-[110]"
            contentClassName="space-y-2 px-8"
            footer={
                <div className="p-4 rounded-2xl bg-[var(--glass-highlight)] border border-[var(--glass-border)]">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('fullPlayer.options.playingFrom')}</div>
                    <div className="text-sm font-medium text-[var(--text-secondary)]">{t(`platforms.${getPlatformI18nKey(currentTrack.source)}`)} — {currentTrack.quality}</div>
                </div>
            }
        >
            {menuView === 'main' ? (
                <>
                    <button onClick={() => handleComingSoon(t('fullPlayer.options.like'))} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                        <Heart className="w-5 h-5 text-[var(--text-muted)] group-hover:text-pink-500 transition-colors" />
                        <span className="font-medium text-[var(--text-main)]">{t('fullPlayer.options.like')}</span>
                    </button>
                    <button onClick={() => setMenuView('playlist')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                        <div className="flex items-center gap-4">
                            <ListMusic className="w-5 h-5 text-[var(--text-muted)] group-hover:text-amber-500 transition-colors" />
                            <span className="font-medium text-[var(--text-main)]">{t('fullPlayer.options.addToPlaylist')}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <button onClick={handleViewArtist} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                        <User className="w-5 h-5 text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors" />
                        <span className="font-medium text-[var(--text-main)]">{t('fullPlayer.options.viewArtist')}</span>
                    </button>
                    <button onClick={handleViewAlbum} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                        <Disc className="w-5 h-5 text-[var(--text-muted)] group-hover:text-emerald-400 transition-colors" />
                        <span className="font-medium text-[var(--text-main)]">{t('fullPlayer.options.viewAlbum')}</span>
                    </button>
                    <div className="my-4 h-px bg-[var(--glass-border)] mx-2"></div>
                    <button onClick={handleShare} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                        {isCopied ? (
                            <>
                                <Check className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-green-500">{t('playlist.linkCopied')}</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-5 h-5 text-[var(--text-muted)] group-hover:text-rose-400 transition-colors" />
                                <span className="font-medium text-[var(--text-main)]">{t('fullPlayer.options.share')}</span>
                            </>
                        )}
                    </button>
                    <button onClick={() => setMenuView('sleep')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group">
                        <div className="flex items-center gap-4">
                            <Clock className="w-5 h-5 text-[var(--text-muted)] group-hover:text-sky-400 transition-colors" />
                            <div className="flex flex-col items-start">
                                <span className="font-medium text-[var(--text-main)]">{t('fullPlayer.options.sleepTimer')}</span>
                                {sleepTimer && <span className="text-xs text-[var(--accent-color)]">{sleepTimer} min</span>}
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                </>
            ) : menuView === 'playlist' ? (
                <div className="animate-fade-in space-y-2">
                    <button onClick={() => setMenuView('main')} className="w-full flex items-center gap-4 p-3 mb-4 rounded-xl text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-sm font-bold">{t('fullPlayer.options.back')}</span>
                    </button>
                    {userPlaylists.map(pl => (
                        <button
                            key={pl.id}
                            onClick={() => handleAddToPlaylist(pl.id)}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors group"
                        >
                            <div className={`w-10 h-10 rounded-lg ${pl.cover} flex-shrink-0`}></div>
                            <div className="text-left">
                                <div className="font-medium text-[var(--text-main)]">{pl.title}</div>
                                <div className="text-xs text-[var(--text-muted)]">{pl.count} {t('fullPlayer.options.songs')}</div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="animate-fade-in space-y-2">
                    <button onClick={() => setMenuView('main')} className="w-full flex items-center gap-4 p-3 mb-4 rounded-xl text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-sm font-bold">{t('fullPlayer.options.back')}</span>
                    </button>
                    {[15, 30, 45, 60, 90].map(min => (
                        <button
                            key={min}
                            onClick={() => handleSetSleepTimer(min)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors ${sleepTimer === min ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]' : 'text-[var(--text-main)]'}`}
                        >
                            <span className="font-medium">{min} {t('common.min', '分钟')}</span>
                            {sleepTimer === min && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                    <button
                        onClick={() => handleSetSleepTimer(null)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--glass-highlight)] transition-colors text-red-400`}
                    >
                        <span className="font-medium">{t('fullPlayer.options.turnOffTimer')}</span>
                        {sleepTimer === null && <Check className="w-4 h-4" />}
                    </button>
                </div>
            )}
        </Drawer>
    );
};
export default OptionsPanel;
