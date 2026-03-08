pub const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

pub mod netease {
    pub const BASE_URL: &str = "https://music.163.com";
    pub const REFERER: &str = "https://music.163.com";
}

pub mod qq {
    pub const MUSICU_URL: &str = "https://u.y.qq.com/cgi-bin/musicu.fcg";
    pub const REFERER: &str = "https://y.qq.com/";
}

pub mod qishui {
    pub const BASE_URL: &str = "https://qishui.douyin.com";
    pub const REFERER: &str = "https://qishui.douyin.com";
}
