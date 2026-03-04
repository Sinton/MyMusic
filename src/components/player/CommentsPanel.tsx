import React from 'react';
import { useTranslation } from 'react-i18next';
import Drawer from '../common/Drawer';
import type { Comment } from '../../types';

interface CommentsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    comments: Comment[];
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
    isOpen,
    onClose,
    comments
}) => {
    const { t } = useTranslation();

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={t('fullPlayer.comments.title')}
            contentClassName="space-y-6 px-8"
            footer={
                <input
                    type="text"
                    placeholder={t('fullPlayer.comments.addPlaceholder')}
                    className="w-full bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                />
            }
        >
            <div className="pb-8">
                {comments.map(comment => (
                    <div key={comment.id} className="mb-6 group">
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full shadow-lg flex-shrink-0 ${comment.avatar}`}></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-[var(--text-main)] truncate">{comment.user}</span>
                                    <span className="text-[10px] text-[var(--text-secondary)] flex-shrink-0 ml-2">{comment.time}</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">{comment.content}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{comment.likes} {t('fullPlayer.comments.likes')}</span>
                                    <button className="text-[10px] text-[var(--accent-color)] font-bold uppercase tracking-wider hover:underline transition-all">{t('fullPlayer.comments.reply')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Drawer>
    );
};

export default CommentsPanel;
