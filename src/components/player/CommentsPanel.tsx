import React from 'react';
import { X } from 'lucide-react';
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
    const [showShadow, setShowShadow] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setShowShadow(true);
        } else {
            const timer = setTimeout(() => setShowShadow(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <div className={`absolute inset-y-0 right-0 w-full lg:w-[450px] glass-drawer border-l border-[var(--glass-border)] z-[100] transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${showShadow ? 'shadow-[-20px_0_50px_rgba(0,0,0,0.3)]' : ''}`}>
            <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[var(--text-main)]">Comments</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--glass-highlight)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    {comments.map(comment => (
                        <div key={comment.id} className="space-y-4 group">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full shadow-lg ${comment.avatar}`}></div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-[var(--text-main)]">{comment.user}</span>
                                        <span className="text-[10px] text-[var(--text-secondary)]">{comment.time}</span>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{comment.content}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{comment.likes} Likes</span>
                                        <button className="text-[10px] text-[var(--accent-color)] font-bold uppercase tracking-wider hover:underline transition-all">Reply</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8">
                    <input type="text" placeholder="Add a comment..." className="w-full bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                </div>
            </div>
        </div>
    );
};

export default CommentsPanel;
