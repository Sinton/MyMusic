import React, { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X, Copy, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const appWindow = getCurrentWindow();

interface TitleBarProps {
    canGoBack?: boolean;
    onBack?: () => void;
    isTransparent?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ canGoBack = false, onBack, isTransparent = false }) => {
    const [isMaximized, setIsMaximized] = useState(false);

    // Delay restoring the TitleBar background and border so it doesn't instantly
    // flash over the FullScreenPlayer while it's still sliding down (500ms duration).
    const [isTransparentDelayed, setIsTransparentDelayed] = useState(isTransparent);
    const { t } = useTranslation();

    useEffect(() => {
        if (isTransparent) {
            setIsTransparentDelayed(true);
        } else {
            const timer = setTimeout(() => setIsTransparentDelayed(false), 0);
            return () => clearTimeout(timer);
        }
    }, [isTransparent]);

    useEffect(() => {
        const checkMaximized = async () => {
            setIsMaximized(await appWindow.isMaximized());
        };

        checkMaximized();
        const unlisten = appWindow.onResized(() => checkMaximized());
        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const minimize = () => appWindow.minimize();
    const toggleMaximize = async () => {
        if (await appWindow.isMaximized()) {
            await appWindow.unmaximize();
        } else {
            await appWindow.maximize();
        }
        setIsMaximized(await appWindow.isMaximized());
    };
    const close = () => appWindow.close();

    // The TitleBar is an overlay over FullScreenPlayer when transparent.
    // FullScreenPlayer respects light/dark theme (bg-[var(--bg-color)]), 
    // so we must use theme text colors, not forced white.
    const commonControlsClass = isTransparentDelayed
        ? "hover:bg-[var(--glass-highlight)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
        : "hover:bg-[var(--glass-highlight)] text-[var(--text-secondary)] hover:text-[var(--text-main)]";

    const closeControlsClass = isTransparentDelayed
        ? "hover:bg-[#c42b1c] hover:text-white text-[var(--text-secondary)]"
        : "hover:bg-[#c42b1c] hover:text-white text-[var(--text-secondary)]";

    return (
        <div className={`top-0 left-0 right-0 h-8 z-[99999] flex items-stretch select-none transition-colors duration-500 ${isTransparentDelayed ? 'fixed bg-transparent pointer-events-none border-b border-transparent' : 'absolute bg-[var(--glass-bg)] backdrop-blur-sm border-b border-[var(--glass-border)]'}`}>
            {/* Left Controls (Back) - Aligned with Right Main Content */}
            <div className={`flex items-center z-50 pointer-events-auto transition-opacity duration-300 ${isTransparentDelayed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {canGoBack && (
                    <button
                        onClick={onBack}
                        className={`flex items-center justify-center w-12 h-full transition-colors focus:outline-none ${commonControlsClass}`}
                        title={t('common.back', 'Back')}
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            {/* Drag Region - Flex-1 matches remaining space */}
            <div
                data-tauri-drag-region
                className="flex-1 flex items-center px-4 pointer-events-auto"
            >
                {/* Optional App Title */}
                <div className="text-[10px] font-medium text-white/30 pointer-events-none uppercase tracking-widest hidden">
                    Vibe Music
                </div>
            </div>

            {/* Window Controls - Separate Flex Item */}
            {/* IMPORTANT: Must NOT overlap with data-tauri-drag-region */}
            <div className="flex bg-transparent z-50 pointer-events-auto">
                <button
                    onClick={minimize}
                    className={`flex items-center justify-center w-12 h-full transition-colors focus:outline-none ${commonControlsClass}`}
                    title="Minimize"
                >
                    <Minus size={14} />
                </button>
                <button
                    onClick={toggleMaximize}
                    className={`flex items-center justify-center w-12 h-full transition-colors focus:outline-none ${commonControlsClass}`}
                    title={isMaximized ? "Restore" : "Maximize"}
                >
                    {isMaximized ? (
                        <Copy size={12} className="transform rotate-180" />
                    ) : (
                        <Square size={12} />
                    )}
                </button>
                <button
                    onClick={close}
                    className={`flex items-center justify-center w-12 h-full transition-colors focus:outline-none ${closeControlsClass}`}
                    title="Close"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};
