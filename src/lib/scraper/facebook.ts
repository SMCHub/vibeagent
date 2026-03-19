// ---------------------------------------------------------------------------
// Facebook Scraper -- Phase 3
// ---------------------------------------------------------------------------
// Requires: Meta Graph API access
// Env vars needed:
//   FACEBOOK_APP_ID       -- Facebook App ID
//   FACEBOOK_APP_SECRET   -- Facebook App Secret
//   FACEBOOK_ACCESS_TOKEN -- Long-lived page access token

import type { BaseScraper, ScrapedItem } from './base';

export class FacebookScraper implements BaseScraper {
  name = 'Facebook';
  platform = 'facebook' as const;

  /**
   * Check that all required Facebook API credentials are present.
   */
  isConfigured(): boolean {
    return !!(
      process.env.FACEBOOK_APP_ID &&
      process.env.FACEBOOK_APP_SECRET &&
      process.env.FACEBOOK_ACCESS_TOKEN
    );
  }

  /**
   * Scrape Facebook posts and comments matching keywords.
   *
   * TODO (Phase 3):
   *  1. Use Graph API to search public pages / groups
   *  2. Fetch posts containing keywords
   *  3. Retrieve engagement metrics (reactions, comments, shares)
   *  4. Normalise into ScrapedItem[]
   */
  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    console.log(`[FacebookScraper] Stub -- keywords: ${keywords.join(', ')}`);
    return [];
  }
}
