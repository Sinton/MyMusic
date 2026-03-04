import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface HomeSearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setActiveQuery: (query: string) => void;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
    searchQuery,
    setSearchQuery,
    setActiveQuery,
}) => {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const { globalSearchShortcut } = useSettingsStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!globalSearchShortcut) return;

            const parts = globalSearchShortcut.split('+');
            const mainKey = parts[parts.length - 1].toUpperCase();
            const hasCtrl = parts.includes('Ctrl');
            const hasShift = parts.includes('Shift');
            const hasAlt = parts.includes('Alt');
            const hasMeta = parts.includes('Meta');

            const match =
                e.key.toUpperCase() === mainKey &&
                e.ctrlKey === hasCtrl &&
                e.shiftKey === hasShift &&
                e.altKey === hasAlt &&
                e.metaKey === hasMeta;

            if (match) {
                const tag = (document.activeElement as HTMLElement)?.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA') return;
                e.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [globalSearchShortcut]);

    return (
        <section className="mb-12 pt-4 pb-4">
            <div className="relative max-w-2xl mx-auto">
                <Search
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchQuery ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'
                        }`}
                />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setActiveQuery(searchQuery);
                        }
                        // Escape → blur the search box
                        if (e.key === 'Escape') {
                            inputRef.current?.blur();
                        }
                    }}
                    placeholder={t('home.searchPlaceholder')}
                    className="w-full bg-[var(--glass-highlight)] border border-[var(--glass-border)] text-[var(--text-main)] rounded-2xl py-4 pl-12 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:bg-[var(--glass-bg)] placeholder-[var(--text-muted)] transition-all shadow-2xl"
                />
                {searchQuery && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setActiveQuery('');
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </section>
    );
};
