import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, QrCode, Smartphone, CheckCircle, Loader2 } from 'lucide-react';
import { PlatformBadge } from './index';
import type { Platform } from '../types';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: Platform | null;
    onConnect: (platformName: string) => void;
}

type AuthStep = 'qrcode' | 'scanning' | 'success';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, platform, onConnect }) => {
    const [step, setStep] = useState<AuthStep>('qrcode');
    const [loading, setLoading] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('qrcode');
            setLoading(false);
        }
    }, [isOpen, platform]);

    const handleSimulateLogin = () => {
        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            setLoading(false);
            setStep('success');
            // Close after success animation
            setTimeout(() => {
                if (platform) {
                    onConnect(platform.name);
                }
                onClose();
            }, 1500);
        }, 2000);
    };

    if (!isOpen || !platform) return null;

    const platformColors: Record<string, string> = {
        'NetEase Cloud': '#e60026',
        'QQ Music': '#31c27c',
        'Soda Music': '#ffde00',
    };

    const accentColor = platformColors[platform.name] || '#fff';

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 antialiased overflow-hidden">
            {/* balanced backdrop */}
            <div
                className="absolute inset-0 bg-black/40 animate-modal-backdrop backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content - High-Fidelity Glass Card */}
            <div className="relative w-full max-w-sm glass-drawer border border-[var(--glass-border)] rounded-[2.5rem] shadow-2xl overflow-hidden animate-modal-content">

                {/* Header */}
                <div className="relative h-32 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${accentColor}40, transparent)` }}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--glass-highlight)] transition-colors text-white/70 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <div className="relative">
                            <PlatformBadge
                                name={platform.name}
                                color={accentColor}
                                size="lg"
                                className="!w-16 !h-16 !rounded-xl mx-auto mb-3 shadow-lg"
                            />
                            {/* Platform Icon Overlay */}
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                                <QrCode className="w-3 h-3 text-black" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-main)]">Connect {platform.name}</h2>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    {step === 'qrcode' && !loading && (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="text-sm text-[var(--text-secondary)] text-center px-4">
                                Open <b>{platform.name} App</b> on your phone and scan the QR code to authorize.
                            </div>

                            {/* QR Code Placeholder */}
                            <div
                                className="w-48 h-48 bg-white p-3 rounded-xl shadow-inner cursor-pointer group relative"
                                onClick={handleSimulateLogin}
                            >
                                <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                    <QrCode className="w-24 h-24 text-gray-800 opacity-20" />
                                </div>

                                {/* Hover Overlay for clicking to test */}
                                <div className="absolute inset-0 bg-black/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                    <Smartphone className="w-8 h-8 mb-2 animate-bounce" />
                                    <span className="text-xs font-bold">Click to Simulate Scan</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Waiting for scan...
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-12 h-12 text-[var(--text-main)] animate-spin" />
                            <p className="text-sm text-[var(--text-secondary)]">Authorizing...</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">Successfully Connected!</h3>
                            <p className="text-sm text-[var(--text-secondary)] text-center">
                                Syncing your library now...
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[var(--glass-highlight)] border-t border-[var(--glass-border)] flex justify-between items-center text-xs text-[var(--text-secondary)]">
                    <span>Privacy Encrypted</span>
                    <span className="hover:text-[var(--text-main)] cursor-pointer">Login with Password</span>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AuthModal;
