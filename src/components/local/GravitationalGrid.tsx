import React, { useState } from 'react';
import TrackCard from './TrackCard';
import { LocalTrack } from '../../stores/useLocalMusicStore';

interface GravitationalGridProps {
    tracks: LocalTrack[];
    onTrackClick: (track: LocalTrack, trackList: LocalTrack[]) => void;
}

const GravitationalGrid: React.FC<GravitationalGridProps> = ({ tracks, onTrackClick }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 px-4 py-8">
            {tracks.map((track, index) => (
                <TrackCard
                    key={track.id as string}
                    track={track}
                    index={index}
                    onClick={() => onTrackClick(track, tracks)}
                    hoveredIndex={hoveredIndex}
                    setHoveredIndex={setHoveredIndex}
                />
            ))}
        </div>
    );
};

export default GravitationalGrid;
