import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Music, X, Play, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QishuiService } from '../../services/QishuiService';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { PlatformBadge } from './badges/PlatformBadge';
import type { ClipboardTrackInfo } from '../../hooks/useClipboardMonitor';
import type { Track } from '../../types';

interface ClipboardMusicToastProps {
    info: ClipboardTrackInfo | null;
    onDismiss: () => void;
}

const ClipboardMusicToast: React.FC<ClipboardMusicToastProps> = ({ info, onDismiss }) => {
    const [trackData, setTrackData] = useState<{
        title: string;
        artist: string;
        artistId?: string;
        album?: string;
        albumId?: string;
        releaseDate?: number;
        qualityLabel?: string;
        isVip?: boolean;
        cover: string;
        url: string;
        durationMs: number;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [visible, setVisible] = useState(false);
    const dismissTimer = useRef<ReturnType<typeof setTimeout>>();
    const { setTrack, setQueue } = usePlayerStore();
    const { t } = useTranslation();

    // Load track info when a new link is detected
    useEffect(() => {
        if (!info) {
            setVisible(false);
            setTrackData(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setTrackData(null);

        QishuiService.getTrackDetail(info.trackId)
            .then(res => {
                if (cancelled) return;
                if (res.data) {
                    // Determine highest quality tag
                    let qualityLabel = 'HQ';
                    let isVip = false;

                    if (res.data.bitRates && res.data.bitRates.length > 0) {
                        const qualities = res.data.bitRates.map((b: any) => b.quality);
                        if (qualities.includes('lossless') || qualities.includes('hi_res')) {
                            qualityLabel = 'SQ';
                        }
                    }
                    if (res.data.labelInfo?.only_vip_download || res.data.groupPlayableLevel === 'vip') {
                        isVip = true;
                    }

                    setTrackData({
                        title: res.data.title,
                        artist: res.data.artist,
                        artistId: res.data.artistId,
                        album: res.data.album,
                        albumId: res.data.albumId,
                        releaseDate: res.data.releaseDate,
                        qualityLabel,
                        isVip,
                        cover: res.data.cover,
                        url: res.data.url,
                        durationMs: res.data.durationMs,
                    });
                }
            })
            .catch(err => {
                console.error('[ClipboardToast] Failed to load track:', err);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        // Slide in after a tiny delay
        requestAnimationFrame(() => setVisible(true));

        // Auto-dismiss after 15 seconds
        dismissTimer.current = setTimeout(() => {
            handleDismiss();
        }, 15000);

        return () => {
            cancelled = true;
            if (dismissTimer.current) clearTimeout(dismissTimer.current);
        };
    }, [info?.trackId]);

    const handleDismiss = useCallback(() => {
        setVisible(false);
        setTimeout(onDismiss, 300); // Wait for exit animation
    }, [onDismiss]);

    const handlePlay = useCallback(async () => {
        if (!trackData || !info) return;
        setPlaying(true);

        try {
            // Format duration
            const totalSec = Math.floor(trackData.durationMs / 1000);
            const min = Math.floor(totalSec / 60);
            const sec = totalSec % 60;
            const durationStr = `${min}:${sec.toString().padStart(2, '0')}`;

            const track: Track = {
                id: info.trackId,
                title: trackData.title,
                artist: trackData.artist,
                artistId: trackData.artistId,
                album: trackData.album || '',
                albumId: trackData.albumId,
                duration: durationStr,
                currentTime: '0:00',
                source: 'soda',           // Platform identifier for detectPlatform()
                sourceId: trackData.url,   // Actual audio URL used by useTrackUrlResolver
                quality: trackData.qualityLabel === 'SQ' ? 'SQ' : 'HQ',
                cover: trackData.cover,
            };

            setQueue([track]);
            setTrack(track);
            handleDismiss();
        } catch (err) {
            console.error('[ClipboardToast] Failed to play:', err);
            setPlaying(false);
        }
    }, [trackData, info, setTrack, setQueue, handleDismiss]);

    if (!info) return null;

    return (
        <div
            className={`fixed bottom-[110px] left-[calc(var(--sidebar-width)_+_24px)] z-[9999] transition-all duration-300 ease-out ${visible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-4 scale-95'
                }`}
        >
            <div className="relative flex items-center gap-4 px-8 h-[76px] rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-[400px]">
                {/* Cover / Icon */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--glass-highlight)] shadow-md">
                    {trackData?.cover ? (
                        <img
                            src={trackData.cover}
                            alt={trackData.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music size={18} className="text-[var(--accent-color)]" />
                        </div>
                    )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center h-full py-2">
                    <div className="text-[10px] text-[var(--accent-color)] font-bold mb-0.5 flex items-center gap-1 uppercase tracking-wider">
                        <PlatformBadge name="Soda Music" size="xs" className="scale-90" />
                        {t('clipboard.detected', { platform: 'Soda Music' })}
                    </div>

                    <div className="h-[36px] flex flex-col justify-center">
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                <Loader2 size={12} className="animate-spin" />
                                {t('clipboard.fetching')}
                            </div>
                        ) : trackData ? (
                            <>
                                <div className="text-sm font-medium text-[var(--text-main)] truncate">
                                    {trackData.title}
                                </div>
                                <div className="text-xs text-[var(--text-secondary)] truncate flex items-center gap-1.5 mt-[2px]">
                                    <span className="truncate">{trackData.artist}</span>
                                    {trackData.album && (
                                        <>
                                            <span className="text-[10px] opacity-40 flex-shrink-0">•</span>
                                            <span className="truncate">{trackData.album}</span>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-[var(--text-muted)]">{t('clipboard.fetchFailed')}</div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center justify-center mr-1">
                    {trackData && (
                        <button
                            onClick={handlePlay}
                            disabled={playing}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--text-main)] text-[var(--bg-color)] hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
                        >
                            {playing ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Play size={14} fill="currentColor" className="ml-0.5" />
                            )}
                        </button>
                    )}
                </div>

                {/* Close Button at top right */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                    <X size={12} />
                </button>
            </div>
        </div>
    );
};

export default ClipboardMusicToast;
