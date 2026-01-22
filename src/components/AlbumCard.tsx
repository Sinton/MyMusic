import React from 'react';
import { Play, Disc } from 'lucide-react';
import type { Album } from '../types';

interface AlbumCardProps {
    album: Album;
    onClick?: (album: Album) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
    return (
        <div
            onClick={() => onClick?.(album)}
            className="group p-4 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
        >
            {/* Cover */}
            <div className={`w-full aspect-square rounded-xl mb-4 shadow-xl ${album.cover} relative flex items-center justify-center overflow-hidden`}>
                {/* Inner Ring */}
                <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none z-10"></div>

                {/* Vinyl Icon */}
                <Disc className="w-1/2 h-1/2 text-white/20 animate-spin-slow-variable" style={{ animationDuration: '10s' }} />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[2px]">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                    </div>
                </div>
            </div>

            {/* Info */}
            <h3 className="font-medium text-[var(--text-main)] truncate text-base">{album.title}</h3>
            <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-[var(--text-secondary)] truncate">{album.artist}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[var(--text-muted)]">
                    {album.year}
                </span>
            </div>
        </div>
    );
};

export default AlbumCard;
