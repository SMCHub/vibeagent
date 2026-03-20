// ---------------------------------------------------------------------------
// TikTok Scraper -- ScrapeCreators API integration
// ---------------------------------------------------------------------------
// Requires:
//   SCRAPECREATORS_API_KEY -- API key from scrapecreators.com
//
// Uses ScrapeCreators v2 API for TikTok video search (keyword-based) and user
// post retrieval. Pricing: ~$0.002/request.
//
// Dual strategy:
//   1. Keyword search  -> GET /v2/tiktok/search?query={keyword}&type=video
//   2. User posts      -> GET /v2/tiktok/user/posts?username={username}
//      (filtered client-side by keywords)

import type { BaseScraper, ScrapedItem } from './base';
import { SOCIAL_MEDIA_TARGETS } from '@/lib/sources/switzerland';

// ---------------------------------------------------------------------------
// ScrapeCreators TikTok response types
// ---------------------------------------------------------------------------

interface SCTikTokAuthor {
  uniqueId: string;
  nickname: string;
}

interface SCTikTokStats {
  diggCount: number;
  shareCount: number;
  commentCount: number;
  playCount: number;
}

interface SCTikTokVideo {
  id: string;
  desc: string;
  createTime: number;
  author: SCTikTokAuthor;
  stats: SCTikTokStats;
  video?: { playAddr?: string; downloadAddr?: string };
}

interface SCTikTokResponse {
  data: SCTikTokVideo[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.scrapecreators.com/v2';
const RATE_LIMIT_MS = 200;
const MAX_AGE_DAYS = 30;

// ---------------------------------------------------------------------------
// Helper: small delay for rate-limiting
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// TikTokScraper
// ---------------------------------------------------------------------------

export class TikTokScraper implements BaseScraper {
  name = 'TikTok';
  platform = 'tiktok' as const;

  // -------------------------------------------------------------------------
  // isConfigured
  // -------------------------------------------------------------------------

  isConfigured(): boolean {
    return !!process.env.SCRAPECREATORS_API_KEY;
  }

  // -------------------------------------------------------------------------
  // Build request headers
  // -------------------------------------------------------------------------

  private get headers(): Record<string, string> {
    return {
      'x-api-key': process.env.SCRAPECREATORS_API_KEY || '',
      'Accept': 'application/json',
    };
  }

  // -------------------------------------------------------------------------
  // Keyword search: GET /v2/tiktok/search?query={keyword}&type=video
  // -------------------------------------------------------------------------

  private async searchByKeyword(keyword: string): Promise<SCTikTokVideo[]> {
    const url = `${BASE_URL}/tiktok/search?query=${encodeURIComponent(keyword)}&type=video`;

    try {
      const response = await fetch(url, { method: 'GET', headers: this.headers });

      if (response.status === 401 || response.status === 403) {
        console.error(
          `[TikTokScraper] Auth failure on keyword search (${response.status}) -- check SCRAPECREATORS_API_KEY`,
        );
        return [];
      }

      if (!response.ok) {
        console.warn(
          `[TikTokScraper] Keyword search failed for "${keyword}": ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const result = (await response.json()) as SCTikTokResponse;
      return result.data ?? [];
    } catch (err) {
      console.error(`[TikTokScraper] Keyword search error for "${keyword}":`, err);
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // User posts: GET /v2/tiktok/user/posts?username={username}
  // -------------------------------------------------------------------------

  private async fetchUserPosts(username: string): Promise<SCTikTokVideo[]> {
    const url = `${BASE_URL}/tiktok/user/posts?username=${encodeURIComponent(username)}`;

    try {
      const response = await fetch(url, { method: 'GET', headers: this.headers });

      if (response.status === 401 || response.status === 403) {
        console.error(
          `[TikTokScraper] Auth failure on user posts (${response.status}) -- check SCRAPECREATORS_API_KEY`,
        );
        return [];
      }

      if (!response.ok) {
        console.warn(
          `[TikTokScraper] User posts failed for @${username}: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const result = (await response.json()) as SCTikTokResponse;
      return result.data ?? [];
    } catch (err) {
      console.error(`[TikTokScraper] User posts error for @${username}:`, err);
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // Filter user posts client-side by keywords
  // -------------------------------------------------------------------------

  private filterByKeywords(
    videos: SCTikTokVideo[],
    keywords: string[],
  ): SCTikTokVideo[] {
    const lowerKeywords = keywords.map((k) => k.toLowerCase());
    return videos.filter((video) => {
      const desc = (video.desc || '').toLowerCase();
      return lowerKeywords.some((kw) => desc.includes(kw));
    });
  }

  // -------------------------------------------------------------------------
  // Map a ScrapeCreators TikTok video to ScrapedItem
  // -------------------------------------------------------------------------

  private mapVideo(video: SCTikTokVideo): ScrapedItem {
    const description = video.desc || '';
    const authorId = video.author?.uniqueId || 'unknown';
    const title =
      description.length > 100
        ? description.slice(0, 100) + '...'
        : description;

    return {
      externalId: String(video.id),
      title: title || '(no description)',
      content: description || '(no description)',
      author: video.author?.uniqueId || video.author?.nickname || 'unknown',
      authorUrl: `https://www.tiktok.com/@${authorId}`,
      url: `https://www.tiktok.com/@${authorId}/video/${video.id}`,
      platform: 'tiktok',
      publishedAt: new Date(video.createTime * 1000),
      engagementCount:
        (video.stats?.playCount || 0) +
        (video.stats?.diggCount || 0) +
        (video.stats?.commentCount || 0) +
        (video.stats?.shareCount || 0),
    };
  }

  // -------------------------------------------------------------------------
  // Main scrape method
  // -------------------------------------------------------------------------

  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    if (!this.isConfigured()) {
      console.warn('[TikTokScraper] Not configured (missing SCRAPECREATORS_API_KEY) -- skipping');
      return [];
    }

    if (keywords.length === 0) {
      console.warn('[TikTokScraper] No keywords provided -- skipping');
      return [];
    }

    const tiktokTargets = SOCIAL_MEDIA_TARGETS.filter(
      (t) => t.platform === 'tiktok',
    );
    const usernames = tiktokTargets.map((t) => t.identifier);

    console.log(
      `[TikTokScraper] Scraping via ScrapeCreators API | keywords: ${keywords.join(', ')} ` +
        `| tracking ${tiktokTargets.length} accounts: ${usernames.join(', ')}`,
    );

    const allVideos: SCTikTokVideo[] = [];
    const cutoffDate = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

    // --- Strategy 1: Keyword search ---
    for (const keyword of keywords) {
      const videos = await this.searchByKeyword(keyword);
      allVideos.push(...videos);
      await delay(RATE_LIMIT_MS);
    }

    // --- Strategy 2: User posts (filtered by keywords) ---
    for (const username of usernames) {
      const posts = await this.fetchUserPosts(username);
      const relevant = this.filterByKeywords(posts, keywords);
      allVideos.push(...relevant);
      await delay(RATE_LIMIT_MS);
    }

    if (allVideos.length === 0) {
      console.log('[TikTokScraper] No videos found');
      return [];
    }

    // Age filter: skip videos older than MAX_AGE_DAYS
    const recent = allVideos.filter((v) => {
      const publishedAt = new Date(v.createTime * 1000);
      return publishedAt >= cutoffDate;
    });

    // Deduplicate by video ID
    const deduped = new Map<string, SCTikTokVideo>();
    for (const video of recent) {
      const id = String(video.id);
      if (!deduped.has(id)) {
        deduped.set(id, video);
      }
    }

    const results = Array.from(deduped.values()).map((v) => this.mapVideo(v));

    console.log(
      `[TikTokScraper] Done -- ${results.length} unique videos collected ` +
        `(${allVideos.length} total fetched, ${allVideos.length - recent.length} filtered by age)`,
    );

    return results;
  }
}
