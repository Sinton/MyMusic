import { useQuery } from '@tanstack/react-query';
import { QQService } from '../../services/QQService';
import { qqToSong } from './converters';
import { QQ_KEYS } from './queryKeys';
import type { Album } from '../../types';

/** Album detail and tracklist */
export function useQQAlbumDetail(albumMid: string, options = { enabled: true }) {
    const { data, isLoading, error } = useQuery({
        queryKey: QQ_KEYS.albumDetail(albumMid),
        queryFn: async () => {
            const data = await QQService.getAlbumDetail(albumMid);
            console.log('[useQQAlbumDetail] Raw:', data);

            // music.musichallAlbum.AlbumInfoServer returns req.data
            const reqData = (data as any).req?.data || (data as any).data;
            if (!reqData) throw new Error('Album not found (empty reqData)');

            const info = reqData.basicInfo || reqData.albumInfo || reqData;
            const mid = info.albumMid || info.album_mid || info.mid || albumMid;

            // Tracks can be in req_1.data.songList, reqData.songList or list
            const req1Data = (data as any).req_1?.data;
            const songsRaw = req1Data?.songList || req1Data?.song_list || req1Data?.songlist || reqData.songList || reqData.song_list || reqData.list || [];
            const songs = songsRaw.map((item: any) => qqToSong(item.songInfo || item));

            const artistMid = info.singerMid || info.singer_mid ||
                reqData.singer?.singerList?.[0]?.mid ||
                reqData.singer?.[0]?.mid ||
                (info.singer?.[0]?.mid) ||
                (info.singer?.[0]?.singer_mid);

            const album: Album = {
                id: mid,
                title: info.albumName || info.album_name || info.name || 'Unknown Album',
                platform: 'qq',
                artist: info.singerName || info.singer_name ||
                    reqData.singerName || reqData.singer_name ||
                    reqData.singer?.singerList?.[0]?.name ||
                    reqData.singer?.[0]?.name ||
                    (info.singer?.[0]?.name) ||
                    'Unknown Artist',
                artistId: artistMid,
                artistAvatar: artistMid ? `https://y.gtimg.cn/music/photo_new/T001R300x300M000${artistMid}.jpg` : undefined,
                cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg`,
                songs: songs,
                year: info.publishDate ? parseInt(info.publishDate.split('-')[0]) : (info.publicTime ? parseInt(info.publicTime.split('-')[0]) : (info.pub_time ? parseInt(info.pub_time.split('-')[0]) : 0)),
                count: req1Data?.totalNum || req1Data?.total || songs.length || 0,
            };

            return album;
        },
        enabled: options.enabled && !!albumMid && albumMid !== 'undefined',
    });

    return {
        album: data,
        isLoading,
        error,
    };
}
