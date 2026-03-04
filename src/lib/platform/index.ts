import { MusicPlatform } from '../../types';
import { IPlatformAdapter } from './base';
import { NeteaseAdapter } from './netease';
import { QQAdapter } from './qq';
import { SodaAdapter } from './soda';
import { detectPlatform } from '../platformUtils';

const adapters: Record<MusicPlatform, IPlatformAdapter> = {
    netease: new NeteaseAdapter(),
    qq: new QQAdapter(),
    soda: new SodaAdapter(),
    local: {
        id: 'local',
        name: '本地音乐',
        getArtistPath: () => 'Library',
        getAlbumPath: () => 'Library',
        getSearchPath: (q) => `Search:local:${q}`,
        getReferer: () => undefined
    },
    unknown: {
        id: 'unknown',
        name: '未知平台',
        getArtistPath: () => 'Library',
        getAlbumPath: () => 'Library',
        getSearchPath: () => 'Library',
        getReferer: () => undefined
    }
};

/** Get adapter for a specific platform ID */
export function getPlatformAdapter(platform: MusicPlatform): IPlatformAdapter {
    return adapters[platform] || adapters.unknown;
}

/** Get adapter by detecting platform from a source string */
export function getAdapterBySource(source: string | undefined): IPlatformAdapter {
    const platform = detectPlatform(source);
    return getPlatformAdapter(platform);
}

export * from './base';
