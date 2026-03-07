import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Loader2, ThumbsUp } from 'lucide-react';
import Drawer from '../common/Drawer';
import { MusicComment } from '../../types/gateway';
import { useMusicLatestComments, useMusicHotComments } from '../../hooks/useMusicComments';

interface CommentsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    platform: string;
    songId: string | number;
}

type TabType = 'hot' | 'latest';

const CommentsPanel: React.FC<CommentsPanelProps> = ({
    isOpen,
    onClose,
    platform,
    songId
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('hot');
    const autoSwitchedRef = useRef<Record<string, boolean>>({});

    // Separate refs for each tab to maintain independent scroll positions
    const hotScrollRef = useRef<HTMLDivElement>(null);
    const latestScrollRef = useRef<HTMLDivElement>(null);

    // Reset tab, auto-switch flag and BOTH scroll positions only when song changes
    useEffect(() => {
        setActiveTab('hot');
        if (hotScrollRef.current) hotScrollRef.current.scrollTop = 0;
        if (latestScrollRef.current) latestScrollRef.current.scrollTop = 0;
    }, [songId]);

    // Hooks for infinite scrolling - Only enable the query for the active tab to prevent data collision
    const latestQuery = useMusicLatestComments(platform, songId, {
        enabled: isOpen && !!songId && activeTab === 'latest'
    });
    const hotQuery = useMusicHotComments(platform, songId, {
        enabled: isOpen && !!songId && activeTab === 'hot'
    });

    const activeQuery = activeTab === 'hot' ? hotQuery : latestQuery;

    // Use the maximum total found across any loaded pages of the active query
    const totalCount = activeQuery.data?.pages.reduce((max, page) => Math.max(max, page.total), 0) || 0;

    // Derived lists
    const hotComments = hotQuery.data?.pages.flatMap(page => page.comments) || [];
    const latestComments = latestQuery.data?.pages.flatMap(page => page.comments) || [];

    // Auto switch tab if hot comments are explicitly empty
    useEffect(() => {
        if (!isOpen || !hotQuery.isSuccess || hotQuery.isFetching) return;

        const songKey = `${platform}:${songId}`;
        if (autoSwitchedRef.current[songKey]) return;

        const firstPage = hotQuery.data?.pages[0];
        if (firstPage && firstPage.comments.length === 0 && activeTab === 'hot') {
            setActiveTab('latest');
            autoSwitchedRef.current[songKey] = true;
        } else if (firstPage && firstPage.comments.length > 0) {
            autoSwitchedRef.current[songKey] = true;
        }
    }, [hotQuery.isSuccess, hotQuery.isFetching, hotQuery.data, isOpen, activeTab, songId, platform]);

    // Infinite scroll observer for Hot Comments
    useEffect(() => {
        const container = hotScrollRef.current;
        if (!container || !hotQuery.hasNextPage || hotQuery.isFetching || activeTab !== 'hot') return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollHeight - scrollTop <= clientHeight + 100) {
                hotQuery.fetchNextPage();
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [hotQuery.hasNextPage, hotQuery.isFetching, hotQuery.fetchNextPage, activeTab]);

    // Infinite scroll observer for Latest Comments
    useEffect(() => {
        const container = latestScrollRef.current;
        if (!container || !latestQuery.hasNextPage || latestQuery.isFetching || activeTab !== 'latest') return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollHeight - scrollTop <= clientHeight + 100) {
                latestQuery.fetchNextPage();
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [latestQuery.hasNextPage, latestQuery.isFetching, latestQuery.fetchNextPage, activeTab]);

    const formatTimestamp = (ms: number) => {
        const date = new Date(ms);
        return date.toLocaleDateString();
    };

    const renderComment = (comment: MusicComment) => (
        <div key={comment.id} className="mb-8 group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-4">
                {comment.user.avatarUrl ? (
                    <img
                        src={comment.user.avatarUrl}
                        className="w-10 h-10 rounded-full shadow-md flex-shrink-0 object-cover border border-[var(--glass-border)]"
                        alt={comment.user.nickname}
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full shadow-md flex-shrink-0 bg-gradient-to-br from-[var(--accent-color)]/20 to-purple-500/20 flex items-center justify-center border border-[var(--glass-border)]">
                        <span className="text-xs font-bold opacity-40">{comment.user.nickname.substring(0, 1)}</span>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-[var(--text-main)] truncate hover:text-[var(--accent-color)] cursor-pointer transition-colors">
                            {comment.user.nickname}
                        </span>
                    </div>
                    <p
                        className="text-sm text-[var(--text-secondary)] leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                    />

                    {/* Comment Footer: Time on left, Likes/Reply on right */}
                    <div className="flex items-center justify-between mt-3 text-[10px] text-[var(--text-muted)] font-medium">
                        <span>{formatTimestamp(comment.time)}</span>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 hover:text-[var(--accent-color)] transition-colors cursor-pointer group/like">
                                {comment.likedCount > 0 && <span className="text-[9px] font-bold leading-none">{comment.likedCount.toLocaleString()}</span>}
                                <ThumbsUp className={`w-3.5 h-3.5 relative -top-[2px] transition-transform group-hover/like:scale-110 ${comment.liked ? 'text-[var(--accent-color)]' : ''}`} />
                            </div>
                            <button className="hover:text-[var(--accent-color)] transition-colors uppercase tracking-wider">
                                {t('fullPlayer.comments.reply')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'hot' as TabType, label: t('fullPlayer.comments.hotComments') },
        { id: 'latest' as TabType, label: t('fullPlayer.comments.latestComments') }
    ];

    const renderCommentList = (
        query: any,
        comments: MusicComment[],
        scrollRef: React.RefObject<HTMLDivElement>,
        isActive: boolean
    ) => (
        <div
            ref={scrollRef}
            className={`flex-1 overflow-y-auto px-8 custom-scrollbar pb-8 pt-6 ${isActive ? '' : 'hidden'}`}
        >
            {query.isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin opacity-50" />
                </div>
            ) : comments.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium text-sm">{t('fullPlayer.comments.noComments')}</p>
                </div>
            ) : (
                <>
                    {comments.map(comment => renderComment(comment))}

                    {query.hasNextPage && (
                        <div className="py-8 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-[var(--accent-color)] animate-spin opacity-50" />
                        </div>
                    )}

                    {!query.hasNextPage && comments.length > 0 && (
                        <div className="py-8 text-center text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest opacity-30">
                            —— {t('fullPlayer.comments.noMore')} ——
                        </div>
                    )}
                </>
            )}
        </div>
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-[var(--text-main)]">{t('fullPlayer.comments.title')}</h3>
                    <div className="flex items-center gap-1.5">
                        {totalCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-[var(--glass-highlight)] text-[10px] text-[var(--text-muted)] font-bold">
                                {totalCount.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            }
            contentClassName="!p-0 flex flex-col h-full overflow-hidden"
            footer={
                <div className="pt-4 opacity-50 cursor-not-allowed">
                    <input
                        type="text"
                        disabled
                        placeholder={t('fullPlayer.comments.addPlaceholder') + ' (Coming Soon)'}
                        className="w-full bg-[var(--glass-highlight)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none"
                    />
                </div>
            }
        >
            {/* Tabs */}
            <div className="flex items-center gap-8 px-8 border-b border-[var(--glass-border)] sticky top-0 bg-[var(--bg-main)]/80 backdrop-blur-xl z-20">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id
                            ? 'text-[var(--accent-color)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Scrollable Lists (Both are in DOM, only active is shown) */}
            <div className="flex-1 relative flex flex-col overflow-hidden">
                {renderCommentList(hotQuery, hotComments, hotScrollRef, activeTab === 'hot')}
                {renderCommentList(latestQuery, latestComments, latestScrollRef, activeTab === 'latest')}
            </div>
        </Drawer>
    );
};

export default CommentsPanel;
