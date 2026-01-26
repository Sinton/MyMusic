import type { Comment } from '../../types';

export const mockComments: Comment[] = [
    {
        id: 1,
        user: "MusicLover_99",
        avatar: "bg-blue-500",
        content: "This song brings back so many memories! 😭",
        time: "2 hours ago",
        likes: 128,
        liked: true
    },
    {
        id: 2,
        user: "JayChouFan",
        avatar: "bg-pink-500",
        content: "永远的周杰伦，华语乐坛的的神！",
        time: "5 hours ago",
        likes: 3452,
        liked: true
    },
    {
        id: 3,
        user: "VibeMaster",
        avatar: "bg-purple-500",
        content: "Production quality on this track is insane.",
        time: "1 day ago",
        likes: 56,
        liked: false
    }
];
