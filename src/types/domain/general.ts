// ================== PLATFORM ==================
export interface Platform {
    name: string;
    connected: boolean;
    vip: boolean;
    color: string;
}

// ================== HOME CARD ==================
export interface HomeCard {
    title: string;
    description: string;
    color: string;
}

// ================== COMMENT ==================
export interface Comment {
    id: number;
    user: string;
    avatar: string;
    content: string;
    time: string;
    likes: number;
}

// ================== LYRIC LINE ==================
export interface LyricLine {
    time: number;
    text: string;
}
