import React from 'react';
import { ListMusic } from 'lucide-react';
import type { Playlist } from '../../../types';
import PlatformBadge from '../../common/badges/PlatformBadge';

interface PlaylistCardProps {
    playlist: Playlist;
    onClick?: (playlist: Playlist) => void;
    variant?: 'default' | 'compact';
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick, variant = 'default' }) => {
    const isImage = playlist.cover?.includes('/') || playlist.cover?.includes('.');

    const renderSourceBadge = () => {
        if (!playlist.source) return null;
        if (playlist.source === 'vibe' || playlist.source === 'Local') {
            return (
                <PlatformBadge
                    name="Vibe"
                    color="var(--accent-color)"
                    size="sm"
                    className="absolute bottom-2 right-2 shadow-lg border border-white/20 z-20"
                />
            );
        }
        return (
            <PlatformBadge
                name={playlist.source === 'netease' ? 'NetEase' : playlist.source}
                color={playlist.source === 'netease' ? '#e60026' : '#333'}
                size="sm"
                className="absolute bottom-2 right-2 shadow-lg border border-white/10 z-20"
            />
        );
    };

    if (variant === 'compact') {
        return (
            <div
                onClick={() => onClick?.(playlist)}
                className="min-w-[160px] group cursor-pointer"
            >
                <div className="w-full h-[160px] mb-2 rounded-lg shadow-lg overflow-hidden relative">
                    {isImage ? (
                        <img
                            src={playlist.cover}
                            alt={playlist.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className={`w-full h-full ${playlist.cover} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                            <ListMusic className="w-10 h-10 text-white/50" />
                        </div>
                    )}
                    {renderSourceBadge()}
                </div>
                <div className="font-medium text-sm truncate text-[var(--text-main)]">{playlist.title}</div>
                <div className="text-xs text-[var(--text-secondary)]">{playlist.count}</div>
            </div>
        );
    }

    return (
        <div
            onClick={() => onClick?.(playlist)}
            className="group p-4 rounded-xl bg-[var(--glass-highlight)] hover:bg-[var(--glass-border)] transition-colors cursor-pointer"
        >
            {/* Cover */}
            <div className="w-full aspect-square rounded-lg mb-4 shadow-lg overflow-hidden relative">
                {isImage ? (
                    <img
                        src={playlist.cover}
                        alt={playlist.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className={`w-full h-full ${playlist.cover} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                        <ListMusic className="w-10 h-10 text-white/50" />
                    </div>
                )}
                {renderSourceBadge()}
            </div>
            <div className="font-medium text-sm truncate text-[var(--text-main)]">{playlist.title}</div>
            <div className="text-xs text-[var(--text-secondary)]">{playlist.count}</div>
        </div>
    );
};

export default PlaylistCard;
