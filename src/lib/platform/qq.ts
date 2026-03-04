import { BasePlatformAdapter } from './base';
import { MusicPlatform } from '../../types';

export class QQAdapter extends BasePlatformAdapter {
    readonly id: MusicPlatform = 'qq';
    readonly name = 'QQ 音乐';
    readonly baseUrl = 'https://y.qq.com/';

    getReferer(): string | undefined {
        return this.baseUrl;
    }
}
