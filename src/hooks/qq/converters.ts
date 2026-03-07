import type { Song, AudioSource, Playlist, Album, Artist } from '../../types';

/** Convert a QQ Music song item (2025.10 API format) to our app's Song type */
export function qqToSong(item: any): Song {
    if (!item) return { songId: 0, title: 'Unknown', platform: 'qq', artist: 'Unknown', album: 'Unknown', duration: '0:00', sources: [], bestSource: 'qq' };

    // Use numeric ID as the primary 'songId' that the backend comment API needs
    const songId = String(item.id || '');
    // Prefer string mid (alphanumeric) for URLs and other use cases if needed, otherwise use songId
    const songMid = item.mid || item.songmid || songId;

    const artistName = (item.singer || item.singer_list)?.map((s: any) => s.name).join(', ') || 'Unknown Artist';
    const singers = item.singer || item.singer_list || [];
    const artistMid = singers[0]?.mid || singers[0]?.singer_mid || singers[0]?.singerMid || '';
    const albumName = item.album?.name || item.album?.title || 'Unknown Album';
    // Prefer string mid (alphanumeric) over numeric id for QQ Music API compatibility
    const albumMid = item.album?.mid || item.album?.album_mid || item.album?.pmid || '';

    const durationMs = (item.interval || 0) * 1000;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    const source: AudioSource = {
        platform: 'qq',
        quality: 'hq',
        qualityLabel: 'HQ',
        vip: item.pay?.pay_play === 1,
        color: '#31c27c',
        songId: songId,
        songMid: songMid,
    };

    const songTitleBase = item.title || item.name || 'Unknown Title';
    const subtitle = item.subtitle || '';
    const songTitle = subtitle ? `${songTitleBase} (${subtitle})` : songTitleBase;

    return {
        songId: songId,
        songMid: songMid,
        title: songTitle,
        platform: 'qq',
        artist: artistName,
        artistId: artistMid,
        album: albumName,
        albumId: albumMid,
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        sources: [source],
        bestSource: 'QQ Music',
        cover: albumMid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumMid}.jpg` : undefined,
    };
}

/** Convert QQ album item to our app's Album type */
export function qqToAlbum(item: any): Album {
    const mid = item.albumMid || item.album_mid || item.mid || '';
    const yearStr = item.publishDate || item.pubTime || item.publicTime || item.pub_time || '';
    let year = 0;
    if (yearStr && typeof yearStr === 'string') {
        year = parseInt(yearStr.split('-')[0]) || 0;
    } else if (typeof yearStr === 'number') {
        year = yearStr;
    } else {
        year = new Date().getFullYear();
    }

    return {
        id: mid,
        title: item.albumName || item.album_name || item.name || item.title || 'Unknown Album',
        platform: 'qq',
        artist: item.singerName || item.singer_name || (item.singer?.[0]?.name) || (item.singer_list?.[0]?.name) || 'Unknown Artist',
        artistId: item.singerMid || item.singer_mid || (item.singer?.[0]?.mid) || (item.singer_list?.[0]?.mid),
        year: year,
        cover: mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg` : '',
        count: item.totalNum || item.songNum || item.song_count || item.total_song || item.total || item.song_num || (item.albumType === 'Single' ? 1 : 0),
    };
}

/** Convert QQ playlist item to our app's Playlist type */
export function qqToPlaylist(item: any): Playlist {
    return {
        id: item.dissid,
        title: item.dissname,
        platform: 'qq',
        count: item.song_cnt || 0,
        creator: '', // Not easily available in result
        cover: item.imgurl || '',
        isSubscribed: item.dirid !== 0, // dirid 0 usually means self created
    };
}

/** Convert QQ artist data */
export function qqToArtist(mid: string, info: any, bio: string, reqData: any): Artist {
    return {
        id: mid,
        name: info.name || info.singer_name || info.SingerName || info.singerName,
        platform: 'qq',
        avatar: `https://y.gtimg.cn/music/photo_new/T001R300x300M000${mid}.jpg`,
        bio: bio.replace(/<br>/g, '\n').trim(),
        songCount: reqData?.total_song || info.song_count || info.songNum || info.total_song || 0,
        albumCount: reqData?.total_album || info.album_count || info.albumNum || info.total_album || 0,
    };
}
