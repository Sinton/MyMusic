import React, { useEffect, useState } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { Minus, Square, X, Copy } from 'lucide-react';

export const TitleBar: React.FC = () => {
    const [isMaximized, setIsMaximized] = useState(false);

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
        await appWindow.toggleMaximize();
        setIsMaximized(await appWindow.isMaximized());
    };
    const close = () => appWindow.close();

    return (
        <div className="fixed top-0 left-0 right-0 h-8 z-[99999] flex items-stretch select-none">
            {/* Drag Region - Flex-1 matches remaining space */}
            <div
                data-tauri-drag-region
                className="flex-1 flex items-center px-4"
            // No pointer-events needed here, default is auto
            >
                {/* Optional App Title */}
                <div className="text-[10px] font-medium text-white/30 pointer-events-none uppercase tracking-widest hidden">
                    Vibe Music
                </div>
            </div>

            {/* Window Controls - Separate Flex Item */}
            {/* IMPORTANT: Must NOT overlap with data-tauri-drag-region */}
            <div className="flex bg-transparent z-50">
                <button
                    onClick={minimize}
                    className="flex items-center justify-center w-12 h-full hover:bg-white/10 text-white/70 hover:text-white transition-colors focus:outline-none"
                    title="Minimize"
                >
                    <Minus size={14} />
                </button>
                <button
                    onClick={toggleMaximize}
                    className="flex items-center justify-center w-12 h-full hover:bg-white/10 text-white/70 hover:text-white transition-colors focus:outline-none"
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
                    className="flex items-center justify-center w-12 h-full hover:bg-[#c42b1c] text-white/70 hover:text-white transition-colors focus:outline-none"
                    title="Close"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};
