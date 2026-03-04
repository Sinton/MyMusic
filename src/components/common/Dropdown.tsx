import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
    value: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    width?: string;
    variant?: 'default' | 'outline' | 'ghost';
    direction?: 'up' | 'down';
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select option',
    disabled = false,
    width = 'w-48',
    variant = 'outline',
    direction = 'down'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const getVariantClasses = () => {
        if (disabled) return 'bg-[var(--text-muted)]/10 border-[var(--glass-border)] text-[var(--text-muted)] cursor-not-allowed';

        switch (variant) {
            case 'outline':
                return `bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--glass-border)] hover:bg-[var(--glass-highlight)] ${isOpen ? 'border-[var(--accent-color)] ring-1 ring-[var(--accent-color)]/50' : ''}`;
            case 'ghost':
                return 'bg-transparent hover:bg-[var(--glass-highlight)] border-transparent';
            default: // default
                return 'bg-[var(--glass-highlight)] border-transparent hover:bg-[var(--glass-border)]';
        }
    };

    return (
        <div className={`relative ${width}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-all duration-200 outline-none ${getVariantClasses()}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.icon && <span className="opacity-70">{selectedOption.icon}</span>}
                    <span className={selectedOption ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute z-[200] ${width} my-2 bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-top
                ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                ${direction === 'up' ? 'bottom-full mb-2' : 'top-full'}
                `}
            >
                <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group
                                ${option.value === value
                                    ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--glass-highlight)] hover:text-[var(--text-main)]'
                                }
                            `}
                        >
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center gap-2 font-medium">
                                    {option.icon && <span className="opacity-70">{option.icon}</span>}
                                    <span className="truncate">{option.label}</span>
                                </div>
                                {option.description && (
                                    <span className={`text-xs truncate ${option.value === value ? 'text-[var(--accent-color)]/70' : 'text-[var(--text-muted)]'}`}>
                                        {option.description}
                                    </span>
                                )}
                            </div>
                            {option.value === value && (
                                <Check className="w-3.5 h-3.5 flex-shrink-0 ml-2" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dropdown;
