import { MusicPlatform } from '../../types';

export interface IPlatformAdapter {
    readonly id: MusicPlatform;
    readonly name: string;
    readonly icon?: string;
    readonly baseUrl?: string;

    /** Generate navigation path for artist */
    getArtistPath(id: string | number, name: string): string;

    /** Generate navigation path for album */
    getAlbumPath(id: string | number): string;

    /** Generate search path within platform */
    getSearchPath(query: string): string;

    /** Get anti-hotlink referer */
    getReferer(): string | undefined;
}

export abstract class BasePlatformAdapter implements IPlatformAdapter {
    abstract readonly id: MusicPlatform;
    abstract readonly name: string;
    abstract readonly baseUrl?: string;

    getArtistPath(id: string | number, name: string): string {
        return `Artist:${this.id}:${name}${id ? `:${id}` : ''}`;
    }

    getAlbumPath(id: string | number): string {
        return `Album:${this.id}:${id}`;
    }

    getSearchPath(query: string): string {
        return `Search:${this.id}:${query}`;
    }

    abstract getReferer(): string | undefined;
}
