import React from 'react';

interface GenreCardProps {
    genre: string;
    onClick?: (genre: string) => void;
}

const GenreCard: React.FC<GenreCardProps> = ({ genre, onClick }) => {
    return (
        <div
            onClick={() => onClick?.(genre)}
            className="aspect-video rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[var(--accent-color)] flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
        >
            {genre}
        </div>
    );
};

export default GenreCard;
