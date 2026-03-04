import { BasePlatformAdapter } from './base';
import { MusicPlatform } from '../../types';

export class NeteaseAdapter extends BasePlatformAdapter {
    readonly id: MusicPlatform = 'netease';
    readonly name = '网易云音乐';
    readonly baseUrl = 'https://music.163.com/';

    getReferer(): string | undefined {
        return this.baseUrl;
    }
}
