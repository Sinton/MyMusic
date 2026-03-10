import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SonarScannerProps {
    isScanning: boolean;
    foundCount: number;
}

const SonarScanner: React.FC<SonarScannerProps> = ({ isScanning, foundCount }) => {
    const { t } = useTranslation();

    if (!isScanning) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--main-bg)]/80 backdrop-blur-md rounded-3xl overflow-hidden"
        >
            {/* Sonar Rings */}
            <div className="relative flex items-center justify-center w-64 h-64">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.5, opacity: 0.8 }}
                        animate={{
                            scale: 2.5,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 1,
                            ease: "easeOut"
                        }}
                        className="absolute w-full h-full border-2 border-[var(--accent-color)] rounded-full"
                    />
                ))}

                {/* Central Core */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center shadow-2xl shadow-[var(--accent-color)]/50"
                >
                    <Music className="w-10 h-10 text-white" />
                </motion.div>

                {/* Radar Line */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 z-0 origin-center"
                >
                    <div className="absolute top-0 left-1/2 -ml-[1px] w-[2px] h-1/2 bg-gradient-to-t from-[var(--accent-color)] to-transparent" />
                </motion.div>
            </div>

            <div className="mt-12 text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <Radio className="w-5 h-5 text-[var(--accent-color)] animate-pulse" />
                    <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-widest uppercase opacity-80">
                        {t('local.scanning_sonar')}
                    </h2>
                </div>

                {foundCount > 0 && (
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-[var(--accent-color)] font-mono text-lg"
                    >
                        {foundCount} TRACKS DIGESTED
                    </motion.p>
                )}

                <p className="text-[var(--text-secondary)] text-sm animate-pulse max-w-xs">
                    Traversing local clusters for high-fidelity audio data...
                </p>
            </div>

            {/* Background Data Stream (Visual Only) */}
            <div className="absolute bottom-8 left-0 right-0 px-12 opacity-10 font-mono text-[10px] overflow-hidden whitespace-nowrap mask-linear-fade">
                {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ x: [-1000, 1000] }}
                        transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                        className="mb-1"
                    >
                        EXTRACTING ID3_V2_4 METADATA... {Math.random().toString(16).substring(2, 20)} ... BUFFERING FLAC STREAM ... 0x{Math.random().toString(16).substring(2, 6)}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default SonarScanner;
