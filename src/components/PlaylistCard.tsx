import React from 'react';
import { Play, ListMusic } from 'lucide-react';
import type { Playlist } from '../types';

interface PlaylistCardProps {
    playlist: Playlist;
    onClick?: (playlist: Playlist) => void;
    variant?: 'default' | 'compact';
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick, variant = 'default' }) => {
    if (variant === 'compact') {
        return (
            <div
                onClick={() => onClick?.(playlist)}
                className="min-w-[160px] group cursor-pointer"
            >
                <div className={`w-full h-[160px] ${playlist.cover} rounded-lg mb-2 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <ListMusic className="w-10 h-10 text-white/50" />
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
            <div className={`w-full aspect-square rounded-lg mb-4 shadow-lg ${playlist.cover} relative flex items-center justify-center`}>
                <ListMusic className="w-12 h-12 text-white/50" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Play className="w-12 h-12 text-white fill-current" />
                </div>
            </div>

            {/* Info */}
            <h3 className="font-medium text-[var(--text-main)] truncate">{playlist.title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
                {playlist.count} • {playlist.creator}
            </p>
        </div>
    );
};

export default PlaylistCard;
