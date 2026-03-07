import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { QrCode, Smartphone, RefreshCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Skeleton } from '../common/Skeleton';

interface QrLoginPanelProps {
    qrUrl: string;
    isNetease: boolean;
    platformNameTranslated: string;
    phoneError?: string;
    loading?: boolean;
    onSimulateLogin: () => void;
}

const QrLoginPanel: React.FC<QrLoginPanelProps> = ({
    qrUrl,
    isNetease,
    platformNameTranslated,
    phoneError,
    loading,
    onSimulateLogin,
}) => {
    const { t } = useTranslation();

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
                className={`w-40 h-40 rounded-2xl transition-all duration-200 flex items-center justify-center relative overflow-hidden ${loading ? 'bg-gray-100 animate-pulse border-transparent' :
                    (!qrUrl && phoneError) ? 'bg-red-50 border border-red-200 cursor-pointer' :
                        'bg-white shadow-sm border border-[var(--glass-border)]'
                    }`}
                onClick={(!qrUrl && isNetease) ? onSimulateLogin : (isNetease ? undefined : onSimulateLogin)}
            >
                {(loading || (isNetease && !qrUrl && !phoneError)) ? (
                    /* Improved Skeleton visibility */
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Skeleton width="100%" height="100%" variant="rectangular" className="rounded-2xl !bg-black/5 dark:!bg-white/5" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <QrCode className="w-12 h-12 text-[var(--text-muted)] opacity-20" />
                        </div>
                    </div>
                ) : (isNetease && !qrUrl && phoneError) ? (
                    /* Elegant Error State: Minimalist Larger Icon */
                    <div className="p-3 w-full h-full relative group/error animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-full h-full border-2 border-dashed border-red-500/20 rounded-lg flex items-center justify-center bg-red-400/5 transition-all group-hover/error:bg-red-500/10">
                            <QrCode className="w-16 h-16 text-red-500/10" />
                        </div>

                        {/* Ultra-Modern Glass Retry Layer */}
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] flex flex-col items-center justify-center opacity-0 group-hover/error:opacity-100 transition-all duration-300 rounded-2xl cursor-pointer">
                            <div className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center group-active/error:scale-95 transition-transform duration-200">
                                <RefreshCcw className="w-6 h-6 text-red-500 group-hover/error:animate-spin-slow" />
                            </div>
                            <span className="mt-4 text-[11px] font-black text-red-500 uppercase tracking-[0.3em]">{t('auth.retryShort', '重新获取')}</span>
                        </div>
                    </div>
                ) : (isNetease && qrUrl) ? (
                    /* Success: Real QR (Direct swap) */
                    <div className="p-3 w-full h-full animate-in zoom-in-95 duration-300">
                        <QRCodeSVG
                            value={qrUrl}
                            size={136}
                            level="M"
                            includeMargin={false}
                            style={{ width: '100%', height: '100%', filter: 'contrast(1.1)' }}
                        />
                    </div>
                ) : (
                    /* Mock / Placeholder State for Simulated Login */
                    <div className="p-3 w-full h-full relative group/mock">
                        <div className="w-full h-full border-2 border-dashed border-[var(--glass-border)] rounded-lg flex items-center justify-center bg-[var(--glass-highlight)]/30">
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
                {(loading || (isNetease && !qrUrl && !phoneError)) ? (
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
