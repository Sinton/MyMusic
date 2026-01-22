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
    return (
        <div className={`absolute inset-y-0 right-0 w-full lg:w-[450px] bg-[#0a0a0c]/95 backdrop-blur-3xl border-l border-white/10 z-[100] transition-transform duration-500 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Comments</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
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
                                        <span className="text-sm font-bold text-white/90">{comment.user}</span>
                                        <span className="text-[10px] text-white/20">{comment.time}</span>
                                    </div>
                                    <p className="text-sm text-white/60 leading-relaxed">{comment.content}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{comment.likes} Likes</span>
                                        <button className="text-[10px] text-[var(--accent-color)] font-bold uppercase tracking-wider hover:underline transition-all">Reply</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8">
                    <input type="text" placeholder="Add a comment..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                </div>
            </div>
        </div>
    );
};

export default CommentsPanel;
