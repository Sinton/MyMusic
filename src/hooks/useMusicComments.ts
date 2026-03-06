import { useInfiniteQuery } from '@tanstack/react-query';
import { useMusicApiGateway } from './useMusicApiGateway';
import { MusicComments } from '../types/gateway';
import { APP_CONFIG } from '../config';

/**
 * Hook to fetch latest comments with infinite scroll support
 */
export function useMusicLatestComments(
    platform: string,
    songId: string | number,
    options = { enabled: true }
) {
    const { request } = useMusicApiGateway();
    const limit = 20;

    return useInfiniteQuery({
        queryKey: ['music-comments-latest', platform, songId],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await request(platform, 'song_comments', {
                id: songId,
                offset: pageParam,
                limit
            });
            if (res?.type === 'Comments') {
                return res.data as MusicComments;
            }
            throw new Error('Failed to fetch music comments');
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const currentCount = allPages.length * limit;
            if (lastPage.hasMore || (lastPage.total > currentCount && lastPage.comments.length > 0)) {
                return currentCount;
            }
            return undefined;
        },
        enabled: options.enabled && !!songId && !!platform,
        staleTime: APP_CONFIG.cache.commentsStaleTime,
    });
}

/**
 * Hook to fetch hot comments with infinite scroll support
 */
export function useMusicHotComments(
    platform: string,
    songId: string | number,
    options = { enabled: true }
) {
    const { request } = useMusicApiGateway();
    const limit = 20;

    return useInfiniteQuery({
        queryKey: ['music-comments-hot', platform, songId],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await request(platform, 'song_hot_comments', {
                id: songId,
                offset: pageParam,
                limit
            });
            if (res?.type === 'Comments') {
                return res.data as MusicComments;
            }
            throw new Error('Failed to fetch hot comments');
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const currentCount = allPages.length * limit;
            if (lastPage.hasMore || (lastPage.total > currentCount && lastPage.comments.length > 0)) {
                return currentCount;
            }
            return undefined;
        },
        enabled: options.enabled && !!songId && !!platform,
        staleTime: APP_CONFIG.cache.commentsStaleTime,
    });
}
