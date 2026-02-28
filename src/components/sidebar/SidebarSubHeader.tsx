import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SidebarSubHeaderProps {
    label: string;
    isExpanded: boolean;
    onToggle: () => void;
}

export const SidebarSubHeader: React.FC<SidebarSubHeaderProps> = ({
    label,
    isExpanded,
    onToggle
}) => (
    <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 pl-7 pr-3 py-1 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors uppercase tracking-widest group mt-1"
    >
        <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        {label}
    </button>
);
