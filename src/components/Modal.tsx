import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 antialiased overflow-hidden">
            {/* Smooth Backdrop with Blossom Effect */}
            <div
                className="absolute inset-0 bg-black/40 animate-modal-backdrop backdrop-blur-md"
                onClick={onClose}
            />

            {/* High-Performance Spring Animation Card */}
            <div className="relative w-full max-w-sm glass-drawer border border-[var(--glass-border)] rounded-[2.5rem] shadow-2xl overflow-hidden animate-modal-content">
                {/* Surface Shine Sweep */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

                {/* Inner Glow Header */}
                <div className="flex items-center justify-between p-8 pb-2 relative z-10">
                    <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase italic drop-shadow-sm">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--glass-highlight)] rounded-full transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 pt-6 relative z-10">
                    {children}
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent" />
            </div>
        </div>,
        document.body
    );
};
