// ---------------------------------------------------------------------------
// Instagram Scraper -- Phase 3
// ---------------------------------------------------------------------------
// Requires: Instagram Graph API (via Meta Business Suite)
// Env vars needed:
//   INSTAGRAM_ACCESS_TOKEN -- Long-lived Instagram access token
//   INSTAGRAM_BUSINESS_ID  -- Instagram Business Account ID

import type { BaseScraper, ScrapedItem } from './base';

export class InstagramScraper implements BaseScraper {
  name = 'Instagram';
  platform = 'instagram' as const;

  /**
   * Check that Instagram API credentials are present.
   */
  isConfigured(): boolean {
    return !!(
      process.env.INSTAGRAM_ACCESS_TOKEN &&
      process.env.INSTAGRAM_BUSINESS_ID
    );
  }

  /**
   * Scrape Instagram posts and reels matching keywords.
   *
   * TODO (Phase 3):
   *  1. Use Instagram Graph API hashtag search endpoint
   *  2. Search for posts containing relevant hashtags / mentions
   *  3. Retrieve engagement metrics (likes, comments)
   *  4. Normalise into ScrapedItem[]
   *
   * Note: Instagram API is restrictive -- consider supplementing
   * with CrowdTangle or Apify for broader coverage.
   */
  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    console.log(`[InstagramScraper] Stub -- keywords: ${keywords.join(', ')}`);
    return [];
  }
}
