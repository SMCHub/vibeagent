// ---------------------------------------------------------------------------
// YouTube Scraper -- YouTube Data API v3
// ---------------------------------------------------------------------------
// Requires: YouTube Data API v3
// Env vars needed:
//   YOUTUBE_API_KEY -- Google Cloud API key with YouTube Data API enabled
//
// Quota notes (daily quota: 10,000 units):
//   - search.list costs 100 units per request
//   - videos.list  costs 1 unit per video (batched up to 50)
//   We issue ONE search request (100 units) + 1 videos.list (1 unit) = ~101 units per scrape.

import type { BaseScraper, ScrapedItem } from './base';
import { SOCIAL_MEDIA_TARGETS } from '@/lib/sources/switzerland';

// ---------------------------------------------------------------------------
// YouTube API response types
// ---------------------------------------------------------------------------

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
  error?: { code: number; message: string };
}

interface YouTubeVideoStatistics {
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

interface YouTubeVideoItem {
  id: string;
  statistics: YouTubeVideoStatistics;
}

interface YouTubeVideosResponse {
  items?: YouTubeVideoItem[];
  error?: { code: number; message: string };
}

// ---------------------------------------------------------------------------
// YouTubeScraper
// ---------------------------------------------------------------------------

export class YouTubeScraper implements BaseScraper {
  name = 'YouTube';
  platform = 'youtube' as const;

  private get apiKey(): string {
    return process.env.YOUTUBE_API_KEY ?? '';
  }

  /**
   * Check that the YouTube API key is available.
   */
  isConfigured(): boolean {
    return !!process.env.YOUTUBE_API_KEY;
  }

  /**
   * Scrape YouTube videos matching keywords via the Data API v3.
   *
   * Flow:
   *  1. Build a single search query from the provided keywords (joined with |).
   *  2. Call search.list (100 quota units) to find recent Swiss-region videos.
   *  3. Batch-fetch video statistics via videos.list (1 quota unit).
   *  4. Map results to ScrapedItem[].
   */
  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    if (!this.isConfigured()) {
      console.warn('[YouTubeScraper] YOUTUBE_API_KEY is not set -- skipping.');
      return [];
    }

    if (keywords.length === 0) {
      console.warn('[YouTubeScraper] No keywords provided -- skipping.');
      return [];
    }

    const youtubeTargets = SOCIAL_MEDIA_TARGETS.filter(
      (t) => t.platform === 'youtube',
    );

    console.log(
      `[YouTubeScraper] Searching for ${keywords.length} keyword(s) across ${youtubeTargets.length} YouTube target(s).`,
    );

    try {
      // ------------------------------------------------------------------
      // Step 1 -- Search for videos
      // ------------------------------------------------------------------
      const searchResults = await this.searchVideos(keywords);

      if (searchResults.length === 0) {
        console.log('[YouTubeScraper] No videos found.');
        return [];
      }

      console.log(
        `[YouTubeScraper] Found ${searchResults.length} video(s). Fetching statistics...`,
      );

      // ------------------------------------------------------------------
      // Step 2 -- Batch-fetch video statistics
      // ------------------------------------------------------------------
      const videoIds = searchResults.map((item) => item.id.videoId);
      const statsMap = await this.fetchVideoStatistics(videoIds);

      // ------------------------------------------------------------------
      // Step 3 -- Map to ScrapedItem[]
      // ------------------------------------------------------------------
      const items: ScrapedItem[] = searchResults.map((item) => {
        const videoId = item.id.videoId;
        const stats = statsMap.get(videoId);

        const viewCount = parseInt(stats?.viewCount ?? '0', 10) || 0;
        const likeCount = parseInt(stats?.likeCount ?? '0', 10) || 0;
        const commentCount = parseInt(stats?.commentCount ?? '0', 10) || 0;
        const engagementCount = viewCount + likeCount + commentCount;

        return {
          externalId: videoId,
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          content: (item.snippet.description ?? '').slice(0, 500),
          author: item.snippet.channelTitle,
          authorUrl: `https://www.youtube.com/channel/${item.snippet.channelId}`,
          platform: 'youtube' as const,
          publishedAt: new Date(item.snippet.publishedAt),
          engagementCount,
        };
      });

      console.log(
        `[YouTubeScraper] Returning ${items.length} scraped item(s).`,
      );
      return items;
    } catch (error) {
      console.error('[YouTubeScraper] Unexpected error during scrape:', error);
      return [];
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Call youtube.search.list to find recent videos matching the keywords.
   * Uses a single API call (100 quota units) with keywords joined by "|" (OR).
   */
  private async searchVideos(
    keywords: string[],
  ): Promise<YouTubeSearchItem[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const params = new URLSearchParams({
      part: 'snippet',
      q: keywords.join('|'),
      type: 'video',
      regionCode: 'CH',
      relevanceLanguage: 'de',
      order: 'date',
      publishedAfter: sevenDaysAgo.toISOString(),
      maxResults: '25',
      key: this.apiKey,
    });

    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      if (response.status === 403) {
        console.error(
          '[YouTubeScraper] API quota exceeded or forbidden:',
          body,
        );
        return [];
      }
      if (response.status === 400 || response.status === 401) {
        console.error(
          '[YouTubeScraper] Auth / bad request error:',
          response.status,
          body,
        );
        return [];
      }
      console.error(
        '[YouTubeScraper] Search API error:',
        response.status,
        body,
      );
      return [];
    }

    const data: YouTubeSearchResponse = await response.json();

    if (data.error) {
      console.error(
        '[YouTubeScraper] Search API returned error:',
        data.error.code,
        data.error.message,
      );
      return [];
    }

    return data.items ?? [];
  }

  /**
   * Batch-fetch video statistics via youtube.videos.list.
   * Batches up to 50 IDs per request (1 quota unit per request).
   * Returns a map of videoId -> statistics.
   */
  private async fetchVideoStatistics(
    videoIds: string[],
  ): Promise<Map<string, YouTubeVideoStatistics>> {
    const statsMap = new Map<string, YouTubeVideoStatistics>();

    if (videoIds.length === 0) return statsMap;

    // YouTube allows up to 50 IDs per videos.list request
    const batchSize = 50;
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);

      const params = new URLSearchParams({
        part: 'statistics',
        id: batch.join(','),
        key: this.apiKey,
      });

      const url = `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          const body = await response.text();
          console.error(
            '[YouTubeScraper] Videos API error:',
            response.status,
            body,
          );
          continue;
        }

        const data: YouTubeVideosResponse = await response.json();

        if (data.error) {
          console.error(
            '[YouTubeScraper] Videos API returned error:',
            data.error.code,
            data.error.message,
          );
          continue;
        }

        for (const item of data.items ?? []) {
          statsMap.set(item.id, item.statistics);
        }
      } catch (error) {
        console.error(
          '[YouTubeScraper] Error fetching video statistics batch:',
          error,
        );
      }
    }

    return statsMap;
  }
}
