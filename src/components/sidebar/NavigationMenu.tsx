import React from 'react';
import { Home, Music, Disc } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MenuItem {
    id: string;
    translationKey: string;
    icon: React.FC<{ className?: string }>;
}

interface NavigationMenuProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

const menuItems: MenuItem[] = [
    { id: 'Home', translationKey: 'sidebar.home', icon: Home },
    { id: 'Explore', translationKey: 'sidebar.explore', icon: Disc },
    { id: 'Library', translationKey: 'sidebar.library', icon: Music },
];

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ activeView, onNavigate }) => {
    const { t } = useTranslation();

    return (
        <nav className="px-2 space-y-1 pt-2" style={{ scrollbarGutter: 'stable' }}>
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeView === item.id
                        ? 'bg-[var(--glass-border)] text-[var(--text-main)] font-medium'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-highlight)]'
                        }`}
                >
                    <item.icon className="w-4 h-4" />
                    {t(item.translationKey)}
                </button>
            ))}
        </nav>
    );
};
