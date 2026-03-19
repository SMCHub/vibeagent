// ---------------------------------------------------------------------------
// YouTube Scraper -- Phase 3
// ---------------------------------------------------------------------------
// Requires: YouTube Data API v3
// Env vars needed:
//   YOUTUBE_API_KEY -- Google Cloud API key with YouTube Data API enabled

import type { BaseScraper, ScrapedItem } from './base';

export class YouTubeScraper implements BaseScraper {
  name = 'YouTube';
  platform = 'youtube' as const;

  /**
   * Check that the YouTube API key is available.
   */
  isConfigured(): boolean {
    return !!process.env.YOUTUBE_API_KEY;
  }

  /**
   * Scrape YouTube videos and comments matching keywords.
   *
   * TODO (Phase 3):
   *  1. Use /youtube/v3/search with q=keyword, type=video, regionCode=DE
   *  2. Fetch video details via /youtube/v3/videos for statistics
   *  3. Optionally fetch comment threads via /youtube/v3/commentThreads
   *  4. Map viewCount + likeCount + commentCount to engagementCount
   *  5. Normalise into ScrapedItem[]
   */
  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    console.log(`[YouTubeScraper] Stub -- keywords: ${keywords.join(', ')}`);
    return [];
  }
}
