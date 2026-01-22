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
                className="absolute inset-0 bg-black/40 animate-modal-backdrop"
                onClick={onClose}
            />

            {/* High-Performance Spring Animation Card */}
            <div className="relative w-full max-w-sm bg-white/[0.03] backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_32px_120px_-12px_rgba(0,0,0,0.9)] overflow-hidden animate-modal-content">
                {/* Surface Shine Sweep */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

                {/* Inner Glow Header */}
                <div className="flex items-center justify-between p-8 pb-2 relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 pt-6 relative z-10">
                    {children}
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
        </div>,
        document.body
    );
};
