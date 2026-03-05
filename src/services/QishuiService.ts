import { invoke } from '@tauri-apps/api/core';
import type { QishuiTrackDetail, QishuiLyricResponse, QishuiValidateResponse, QishuiArtistDetail, QishuiAlbumDetail } from '../types/api/qishui';

/**
 * Service layer for Qishui Music (汽水音乐) — Phase 1: SSR page parsing.
 * Follows the same pattern as QQService.ts.
 */
export const QishuiService = {
    /**
     * Call Qishui API via Rust backend provider
     */
    async _request<T>(apiName: string, params: Record<string, any> = {}): Promise<T> {
        const traceId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const paramString = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
            .join('&');

        console.log(`[QishuiService][${traceId}] Requesting API: ${apiName}`, params);

        const res = await invoke<any>('request_api', {
            provider: 'qishui',
            apiName,
            params: paramString,
            cookie: '',
            traceId,
        });

        return res.body as T;
    },

    /**
     * Get track detail by track_id (from share link).
     * Fetches the SSR page and extracts title, artist, cover, audio URL, etc.
     */
    async getTrackDetail(trackId: string): Promise<QishuiTrackDetail> {
        return this._request<QishuiTrackDetail>('track_detail', { track_id: trackId });
    },

    /**
     * Get lyrics for a track by track_id.
     * Returns LRC format string.
     */
    async getLyric(trackId: string): Promise<QishuiLyricResponse> {
        return this._request<QishuiLyricResponse>('lyric', { track_id: trackId });
    },

    /**
     * Resolve a share link (short or full) into full track detail.
     * Handles: qishui.douyin.com/s/xxx, music.douyin.com/qishui/share/track?track_id=xxx
     */
    async resolveShareLink(url: string): Promise<QishuiTrackDetail> {
        return this._request<QishuiTrackDetail>('resolve_link', { url });
    },

    /**
     * Quickly validate if a URL is a Qishui link and extract the track_id
     * without fetching the full track detail. Used for clipboard detection.
     */
    async validateLink(url: string): Promise<QishuiValidateResponse> {
        return this._request<QishuiValidateResponse>('validate_link', { url });
    },

    /**
     * Get artist detail by artist_id.
     * Fetches the SSR artist page and extracts name, avatar, track list, album list, etc.
     */
    async getArtistDetail(artistId: string): Promise<QishuiArtistDetail> {
        return this._request<QishuiArtistDetail>('artist_detail', { artist_id: artistId });
    },

    /**
     * Get album detail by album_id.
     * Fetches the SSR album page and extracts name, cover, release date, track list, etc.
     */
    async getAlbumDetail(albumId: string): Promise<QishuiAlbumDetail> {
        return this._request<QishuiAlbumDetail>('album_detail', { album_id: albumId });
    },

    /**
     * Client-side quick check — no network call.
     * Returns true if the string looks like a Qishui/Douyin music share link.
     */
    isQishuiLink(text: string): boolean {
        return (
            text.includes('qishui.douyin.com') ||
            (text.includes('music.douyin.com') && text.includes('track'))
        );
    },
};

