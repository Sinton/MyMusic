import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { QrCode, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QrLoginPanelProps {
    qrUrl: string;
    isNetease: boolean;
    platformNameTranslated: string;
    onSimulateLogin: () => void;
}

const QrLoginPanel: React.FC<QrLoginPanelProps> = ({
    qrUrl,
    isNetease,
    platformNameTranslated,
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

            {/* QR Code */}
            <div
                className="w-48 h-48 bg-white p-3 rounded-xl shadow-inner cursor-pointer group relative"
                onClick={isNetease ? undefined : onSimulateLogin}
            >
                {isNetease && qrUrl ? (
                    <QRCodeSVG
                        value={qrUrl}
                        size={168}
                        level="M"
                        style={{ width: '100%', height: '100%' }}
                    />
                ) : (
                    <>
                        <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-gray-800 opacity-20" />
                        </div>
                        {!isNetease && (
                            <div className="absolute inset-0 bg-black/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                <Smartphone className="w-8 h-8 mb-2 animate-bounce" />
                                <span className="text-xs font-bold">{t('auth.clickToSimulate')}</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {t('auth.waiting')}
            </div>
        </div>
    );
};

export default QrLoginPanel;
