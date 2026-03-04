import { BasePlatformAdapter } from './base';
import { MusicPlatform } from '../../types';

export class SodaAdapter extends BasePlatformAdapter {
    readonly id: MusicPlatform = 'soda';
    readonly name = '汽水音乐';
    readonly baseUrl = 'https://music.douyin.com/';

    getReferer(): string | undefined {
        return this.baseUrl;
    }
}
