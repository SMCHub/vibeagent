// ---------------------------------------------------------------------------
// Base scraper interface -- all platform scrapers implement this contract
// ---------------------------------------------------------------------------

import type { Platform } from '@/lib/types';

/** A single item returned by any scraper. */
export interface ScrapedItem {
  externalId: string;
  title: string;
  url: string;
  content: string;
  author: string;
  authorUrl: string;
  platform: Platform;
  publishedAt: Date;
  engagementCount: number;
}

/** Every platform scraper must implement this interface. */
export interface BaseScraper {
  /** Human-readable name of the scraper (e.g. "RSS / Pfalz-Express"). */
  name: string;
  /** The platform this scraper targets. */
  platform: Platform;
  /** Returns true when all required env vars / credentials are present. */
  isConfigured(): boolean;
  /** Scrape the platform for items matching the given keywords. */
  scrape(keywords: string[]): Promise<ScrapedItem[]>;
}
