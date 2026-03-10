import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { QrCode, Smartphone, RefreshCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Skeleton } from '../common/Skeleton';

interface QrLoginPanelProps {
    qrUrl: string;
    qrData?: string; // New: Base64 QR image
    isNetease: boolean;
    isQQ: boolean; // New: handle QQ specific display
    platformNameTranslated: string;
    phoneError?: string;
    loading?: boolean;
    onSimulateLogin: () => void;
}

const QrLoginPanel: React.FC<QrLoginPanelProps> = ({
    qrUrl,
    qrData,
    isNetease,
    isQQ,
    platformNameTranslated,
    phoneError,
    loading,
    onSimulateLogin,
}) => {
    const { t } = useTranslation();
    const hasQr = !!qrUrl || !!qrData;

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="text-sm text-[var(--text-secondary)] text-center px-4">
                <Trans
                    i18nKey="auth.scanDesc"
                    values={{ platform: platformNameTranslated }}
                    components={{ b: <b /> }}
                />
            </div>

            {/* QR Code Container / Skeleton / Error State */}
            <div
                className={`w-40 h-40 rounded-2xl transition-all duration-300 flex items-center justify-center relative overflow-hidden border ${(!hasQr && phoneError) ? 'bg-red-50 border-red-200 cursor-pointer' :
                    'bg-[var(--glass-highlight)]/40 border-[var(--glass-border)] shadow-sm'
                    }`}
                onClick={(!hasQr && (isNetease || isQQ)) ? onSimulateLogin : undefined}
            >
                {(loading || ((isNetease || isQQ) && !hasQr && !phoneError)) ? (
                    /* Level 1: Skeleton - Perfect Padding Lock with Assembly Animation */
                    <div className="w-full h-full p-3 flex items-center justify-center">
                        <Skeleton width="100%" height="100%" variant="rectangular" className="rounded-xl !bg-[var(--accent-color)]/10" />

                        {/* Assembly Animation: 4 Quadrants coming together */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                            <div className="relative w-16 h-16">
                                {/* Top Left Shard */}
                                <QrCode
                                    className="absolute inset-0 w-full h-full text-[var(--accent-color)] animate-assemble-tl"
                                    style={{ clipPath: 'inset(0 50% 50% 0)' }}
                                />
                                {/* Top Right Shard */}
                                <QrCode
                                    className="absolute inset-0 w-full h-full text-[var(--accent-color)] animate-assemble-tr"
                                    style={{ clipPath: 'inset(0 0 50% 50%)' }}
                                />
                                {/* Bottom Left Shard */}
                                <QrCode
                                    className="absolute inset-0 w-full h-full text-[var(--accent-color)] animate-assemble-bl"
                                    style={{ clipPath: 'inset(50% 50% 0 0)' }}
                                />
                                {/* Bottom Right Shard */}
                                <QrCode
                                    className="absolute inset-0 w-full h-full text-[var(--accent-color)] animate-assemble-br"
                                    style={{ clipPath: 'inset(50% 0 0 50%)' }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (!hasQr && phoneError) ? (
                    /* Level 2: Error State */
                    <div className="w-full h-full p-3 relative group/error animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-full h-full border-2 border-dashed border-red-500/20 rounded-xl flex items-center justify-center bg-red-400/5 transition-all group-hover/error:bg-red-500/10">
                            <QrCode className="w-16 h-16 text-red-500/10" />
                        </div>
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] flex flex-col items-center justify-center opacity-0 group-hover/error:opacity-100 transition-all duration-300 rounded-2xl cursor-pointer">
                            <div className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center group-active/error:scale-95 transition-transform duration-200">
                                <RefreshCcw className="w-6 h-6 text-red-500 group-hover/error:animate-spin-slow" />
                            </div>
                            <span className="mt-4 text-[11px] font-black text-red-500 uppercase tracking-[0.3em]">{t('auth.retryShort', '重新获取')}</span>
                        </div>
                    </div>
                ) : (isQQ && qrData) ? (
                    /* Level 3: Real QR (QQ Base64) - Same p-3 padding as skeleton */
                    <div className="w-full h-full p-3 animate-in zoom-in-95 duration-300">
                        <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                            <img
                                src={qrData}
                                alt="QQ QR Login"
                                className="w-full h-full object-contain p-1"
                            />
                        </div>
                    </div>
                ) : (qrUrl) ? (
                    /* Level 3: Real QR (SVG) - Same p-3 padding as skeleton */
                    <div className="w-full h-full p-3 animate-in zoom-in-95 duration-300">
                        <div className="w-full h-full bg-white rounded-xl overflow-hidden flex items-center justify-center p-2.5 shadow-inner">
                            <QRCodeSVG
                                value={qrUrl}
                                size={128}
                                level="M"
                                includeMargin={false}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </div>
                ) : (
                    /* Level 4: Mock State */
                    <div className="w-full h-full p-3 relative group/mock">
                        <div className="w-full h-full border-2 border-dashed border-[var(--glass-border)] rounded-xl flex items-center justify-center bg-[var(--glass-highlight)]/30">
                            <QrCode className="w-16 h-16 text-[var(--accent-color)] opacity-10" />
                        </div>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] text-white flex flex-col items-center justify-center opacity-0 group-hover/mock:opacity-100 transition-all duration-300 rounded-2xl">
                            <Smartphone className="w-8 h-8 mb-2 animate-bounce" />
                            <span className="text-[11px] font-bold tracking-[0.2em] uppercase">{t('auth.clickToSimulate')}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Subtle Minimalist Status Footer: Zero-Doubt Transition */}
            <div className="min-h-[24px] flex items-center justify-center w-full transition-all duration-300">
                {(loading || ((isNetease || isQQ) && !hasQr && !phoneError)) ? (
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)] opacity-30 animate-pulse">
                        {t('auth.initializing', '正在初始化...')}
                    </div>
                ) : !phoneError ? (
                    <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--text-muted)] opacity-60 animate-in fade-in duration-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                        {t('auth.waiting', '等待扫码...')}
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 text-[11px] font-bold text-red-500/80 animate-in slide-in-from-top-1 duration-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                        {phoneError}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QrLoginPanel;

