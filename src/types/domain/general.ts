// ================== PLATFORM ==================
export interface Platform {
    name: string;
    connected: boolean;
    vip: boolean;
    color: string;
}

// ================== HOME CARD ==================
export interface HomeCard {
    id: number;
    title: string;
    subtitle: string;
    type: 'playlist' | 'album' | 'song';
    cover: string;
}

// ================== COMMENT ==================
export interface Comment {
    id: number;
    user: string;
    avatar: string;
    content: string;
    time: string;
    likes: number;
    liked: boolean;
}

// ================== LYRIC LINE ==================
export interface LyricLine {
    time: number;
    text: string;
}
