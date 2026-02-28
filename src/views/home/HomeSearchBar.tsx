import React from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

    return (
        <section className="mb-12 pt-4 pb-4">
            <div className="relative max-w-2xl mx-auto">
                <Search
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchQuery ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'
                        }`}
                />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setActiveQuery(searchQuery);
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
