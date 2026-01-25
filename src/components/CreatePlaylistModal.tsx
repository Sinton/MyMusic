import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { Modal } from './index';

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const gradients = [
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-rose-500 to-orange-500',
    'bg-gradient-to-br from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-blue-500 to-cyan-500',
    'bg-gradient-to-br from-amber-500 to-yellow-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-fuchsia-500 to-pink-600',
    'bg-gradient-to-br from-violet-500 to-fuchsia-500'
];

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { createPlaylist } = usePlaylistStore();
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [selectedGradient, setSelectedGradient] = useState(gradients[0]);

    useEffect(() => {
        if (isOpen) {
            setNewPlaylistName('');
            setSelectedGradient(gradients[0]);
        }
    }, [isOpen]);

    const handleCreatePlaylist = () => {
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName.trim(), selectedGradient);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('sidebar.createPlaylist')}
        >
            <div className="space-y-4">
                <div className="space-y-2 animate-stagger-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('sidebar.playlistName')}</label>
                    <input
                        autoFocus
                        type="text"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                        placeholder="e.g. My Awesome Mix"
                        className="w-full bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all font-medium"
                    />
                </div>

                <div className="space-y-2 animate-stagger-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('sidebar.coverStyle')}</label>
                    <div className="grid grid-cols-8 gap-2">
                        {gradients.map((gradient) => (
                            <button
                                key={gradient}
                                onClick={() => setSelectedGradient(gradient)}
                                className={`w-8 h-8 rounded-full ${gradient} relative transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 ${selectedGradient === gradient
                                        ? 'ring-2 ring-white ring-offset-1 ring-offset-black/10 scale-105'
                                        : 'border border-white/10 hover:border-white/30'
                                    }`}
                            >
                                {selectedGradient === gradient && (
                                    <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-200">
                                        <Check className="w-3.5 h-3.5 text-white drop-shadow-md" strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim()}
                    className="w-full py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--accent-color)]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none disabled:bg-[var(--text-muted)] animate-stagger-2"
                >
                    {t('sidebar.createPlaylist')}
                </button>
                <button
                    onClick={onClose}
                    className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors animate-stagger-3"
                >
                    {t('common.cancel')}
                </button>
            </div>
        </Modal>
    );
};

export default CreatePlaylistModal;
