import React from 'react';
import { AlbumCard } from '../../components';
import { Skeleton } from '../../components/common/Skeleton';
import type { Album } from '../../types';

interface LibraryAlbumsTabProps {
    albums: Album[];
    isLoading: boolean;
    onNavigate?: (view: string) => void;
}

export const LibraryAlbumsTab: React.FC<LibraryAlbumsTabProps> = ({ albums, isLoading, onNavigate }) => {
    return (
        <div className="grid grid-cols-4 gap-6">
            {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="w-full aspect-square rounded-2xl" />
                        <Skeleton className="w-3/4 h-4 rounded" />
                        <Skeleton className="w-1/2 h-3 rounded" />
                    </div>
                ))
            ) : (
                albums.map((album: Album) => (
                    <AlbumCard
                        key={album.id}
                        album={album}
                        onClick={() => onNavigate && onNavigate(`Album:${album.id}`)}
                    />
                ))
            )}
        </div>
    );
};
