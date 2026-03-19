// ---------------------------------------------------------------------------
// Reddit Scraper -- Phase 3
// ---------------------------------------------------------------------------
// Requires: Reddit API (OAuth2)
// Env vars needed:
//   REDDIT_CLIENT_ID     -- Reddit app client ID
//   REDDIT_CLIENT_SECRET -- Reddit app client secret
//   REDDIT_USER_AGENT    -- Custom user-agent string (required by Reddit API)
//
// Relevant subreddits for Pfalz region:
//   r/de, r/Pfalz, r/Ludwigshafen, r/Mannheim, r/rheinlandpfalz

import type { BaseScraper, ScrapedItem } from './base';

export class RedditScraper implements BaseScraper {
  name = 'Reddit';
  platform = 'reddit' as const;

  /**
   * Check that Reddit API credentials are present.
   */
  isConfigured(): boolean {
    return !!(
      process.env.REDDIT_CLIENT_ID &&
      process.env.REDDIT_CLIENT_SECRET
    );
  }

  /**
   * Scrape Reddit posts and comments matching keywords.
   *
   * TODO (Phase 3):
   *  1. Authenticate via OAuth2 client_credentials flow
   *  2. Search /r/all and regional subreddits with keyword queries
   *  3. Retrieve posts + top-level comments
   *  4. Map score + num_comments to engagementCount
   *  5. Normalise into ScrapedItem[]
   */
  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    console.log(`[RedditScraper] Stub -- keywords: ${keywords.join(', ')}`);
    return [];
  }
}
