// ---------------------------------------------------------------------------
// Twitter / X Scraper -- Phase 3
// ---------------------------------------------------------------------------
// Requires: Twitter API v2 (Basic or Pro tier for search)
// Env vars needed:
//   TWITTER_BEARER_TOKEN -- Twitter API v2 Bearer Token
//   TWITTER_API_KEY      -- (optional) for OAuth 1.0a user context
//   TWITTER_API_SECRET   -- (optional) for OAuth 1.0a user context

import type { BaseScraper, ScrapedItem } from './base';

export class TwitterScraper implements BaseScraper {
  name = 'Twitter / X';
  platform = 'twitter' as const;

  /**
   * Check that the Twitter Bearer token is available.
   */
  isConfigured(): boolean {
    return !!process.env.TWITTER_BEARER_TOKEN;
  }

  /**
   * Scrape tweets matching keywords via the Twitter API v2 search endpoint.
   *
   * TODO (Phase 3):
   *  1. Use /2/tweets/search/recent with keyword query
   *  2. Include tweet.fields: public_metrics, created_at, author_id
   *  3. Resolve author usernames via /2/users
   *  4. Map retweet_count + like_count + reply_count to engagementCount
   *  5. Normalise into ScrapedItem[]
   */
  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    console.log(`[TwitterScraper] Stub -- keywords: ${keywords.join(', ')}`);
    return [];
  }
}
