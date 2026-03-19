// ---------------------------------------------------------------------------
// TikTok Scraper -- Phase 3
// ---------------------------------------------------------------------------
// Requires: TikTok Research API or third-party scraping service
// Env vars needed:
//   TIKTOK_API_KEY    -- TikTok Research API key
//   TIKTOK_API_SECRET -- TikTok Research API secret
//
// Note: TikTok's official Research API has strict access requirements.
// Consider using a third-party service (e.g. Apify, Ensembl) as fallback.

import type { BaseScraper, ScrapedItem } from './base';

export class TikTokScraper implements BaseScraper {
  name = 'TikTok';
  platform = 'tiktok' as const;

  /**
   * Check that TikTok API credentials are present.
   */
  isConfigured(): boolean {
    return !!(
      process.env.TIKTOK_API_KEY &&
      process.env.TIKTOK_API_SECRET
    );
  }

  /**
   * Scrape TikTok videos matching keywords.
   *
   * TODO (Phase 3):
   *  1. Authenticate with TikTok Research API
   *  2. Search videos by keyword with region filter (DE)
   *  3. Retrieve engagement metrics (views, likes, shares, comments)
   *  4. Normalise into ScrapedItem[]
   */
  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    console.log(`[TikTokScraper] Stub -- keywords: ${keywords.join(', ')}`);
    return [];
  }
}
