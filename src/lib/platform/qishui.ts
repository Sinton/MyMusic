import { BasePlatformAdapter } from './base';
import { MusicPlatform } from '../../types';

export class QishuiAdapter extends BasePlatformAdapter {
    readonly id: MusicPlatform = 'qishui';
    readonly name = '汽水音乐';
    readonly baseUrl = 'https://qishui.douyin.com/';

    getReferer(): string | undefined {
        return this.baseUrl;
    }
}
