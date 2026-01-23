import React from 'react';

interface GenreCardProps {
    genre: string;
    onClick?: (genre: string) => void;
}

const GenreCard: React.FC<GenreCardProps> = ({ genre, onClick }) => {
    return (
        <div
            onClick={() => onClick?.(genre)}
            className="aspect-video rounded-xl bg-[var(--glass-highlight)] border border-[var(--glass-border)] hover:bg-[var(--accent-color)] hover:border-[var(--accent-color)] hover:text-white text-[var(--text-main)] flex items-center justify-center font-bold text-lg cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
        >
            {genre}
        </div>
    );
};

export default GenreCard;
