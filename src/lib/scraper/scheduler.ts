// ---------------------------------------------------------------------------
// Scraper Scheduler -- orchestrates all platform scrapers
// ---------------------------------------------------------------------------
// Install (for cron): npm install node-cron @types/node-cron

import type { ScrapedItem } from './base';
import { RssScraper } from './rss';
import { FacebookScraper } from './facebook';
import { TwitterScraper } from './twitter';
import { InstagramScraper } from './instagram';
import { YouTubeScraper } from './youtube';
import { TikTokScraper } from './tiktok';
import { RedditScraper } from './reddit';

// ---- Registry of all available scrapers ----------------------------------
const ALL_SCRAPERS = [
  new RssScraper(),
  new FacebookScraper(),
  new TwitterScraper(),
  new InstagramScraper(),
  new YouTubeScraper(),
  new TikTokScraper(),
  new RedditScraper(),
];

/**
 * Run every configured scraper in parallel and return the combined results.
 *
 * Scrapers that are not configured (missing env vars) are skipped.
 * Individual scraper failures are caught so one broken scraper does not
 * block the others.
 */
export async function runAllScrapers(
  keywords: string[]
): Promise<ScrapedItem[]> {
  const configured = ALL_SCRAPERS.filter((s) => s.isConfigured());

  console.log(
    `[Scheduler] Running ${configured.length}/${ALL_SCRAPERS.length} configured scrapers`
  );

  const results = await Promise.allSettled(
    configured.map((scraper) =>
      scraper.scrape(keywords).then((items) => {
        console.log(
          `[Scheduler] ${scraper.name} returned ${items.length} items`
        );
        return items;
      })
    )
  );

  const combined: ScrapedItem[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      combined.push(...result.value);
    } else {
      console.error('[Scheduler] Scraper failed:', result.reason);
    }
  }

  // Sort by most recent first
  combined.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  console.log(`[Scheduler] Total items collected: ${combined.length}`);
  return combined;
}

/**
 * Start an automated scraping schedule.
 *
 * TODO (Phase 3):
 *  1. npm install node-cron
 *  2. import cron from 'node-cron'
 *  3. Schedule scraping at desired interval, e.g.:
 *     cron.schedule('0 * * * *', () => runAllScrapers(keywords))  // every hour
 *  4. Add rate-limit tracking per platform
 *  5. Store results in DB via drizzle insert
 *  6. Trigger sentiment analysis pipeline after each run
 */
export function startSchedule(): void {
  console.log(
    '[Scheduler] startSchedule() is a stub -- implement with node-cron in Phase 3'
  );
}
