import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
    /** Whether the drawer is currently open */
    isOpen: boolean;
    /** Callback when the close button is clicked */
    onClose: () => void;
    /** Panel title displayed in the header */
    title: React.ReactNode;
    /** Optional extra elements shown between the title and close button */
    headerExtra?: React.ReactNode;
    /** Content rendered inside the drawer */
    children: React.ReactNode;
    /** Optional footer rendered at the bottom */
    footer?: React.ReactNode;
    /** Width class for large screens. Default: 'lg:w-[450px]' */
    widthClass?: string;
    /** z-index class. Default: 'z-[100]' */
    zIndex?: string;
    /** Additional classNames for the content scrollable area */
    contentClassName?: string;
}

/**
 * Generic slide-in drawer for full-screen player panels.
 * Encapsulates the shared animation, shadow, header, and layout logic
 * used by OptionsPanel, CommentsPanel, QueuePanel, etc.
 */
export const Drawer: React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    title,
    headerExtra,
    children,
    footer,
    widthClass = 'lg:w-[450px]',
    zIndex = 'z-[100]',
    contentClassName = '',
}) => {
    const [showShadow, setShowShadow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowShadow(true);
        } else {
            const timer = setTimeout(() => setShowShadow(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <div
            className={`absolute inset-y-0 right-0 w-full ${widthClass} glass-drawer border-l border-[var(--glass-border)] ${zIndex} transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${showShadow ? 'shadow-[-20px_0_50px_rgba(0,0,0,0.3)]' : ''}`}
        >
            <div className="py-8 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pl-8 pr-4">
                    <div className="flex items-center gap-4">
                        {typeof title === 'string' ? (
                            <h3 className="text-xl font-bold text-[var(--text-main)]">{title}</h3>
                        ) : (
                            title
                        )}
                        {headerExtra}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--glass-highlight)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar ${contentClassName}`}>
                    {children}
                </div>

                {/* Footer (optional) */}
                {footer && (
                    <div className="mt-auto pt-8 px-8">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Drawer;
