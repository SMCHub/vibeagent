// ---------------------------------------------------------------------------
// Scraper Scheduler -- orchestrates all platform scrapers
// ---------------------------------------------------------------------------
// Matches the last30days-skill architecture:
// - Twitter/X: bird cookie auth (free)
// - Reddit, TikTok, Instagram: ScrapeCreators API (one key)
// - YouTube: Data API v3 (free)
// - Hacker News: Algolia API (free, no auth)
// - RSS: Swiss news sources (free)

import type { ScrapedItem } from './base';
import { RssScraper } from './rss';
import { TwitterScraper } from './twitter';
import { RedditScraper } from './reddit';
import { YouTubeScraper } from './youtube';
import { FacebookScraper } from './facebook';
import { InstagramScraper } from './instagram';
import { TikTokScraper } from './tiktok';
import { HackerNewsScraper } from './hackernews';

interface SchedulerOptions {
  /** Primary language: 'de' | 'fr' | 'it' | 'rm' */
  language?: string;
  /** Canton codes to monitor (e.g. ['ZH', 'BE']) */
  cantons?: string[];
  /** Only run scrapers whose platform is in this list. If omitted, all configured scrapers run. */
  enabledPlatforms?: string[];
}

interface SchedulerResult {
  items: ScrapedItem[];
  /** Per-platform breakdown: { platform: count } */
  breakdown: Record<string, number>;
  /** Scrapers that failed */
  errors: { scraper: string; error: string }[];
  /** Total duration in ms */
  durationMs: number;
}

/**
 * Run every configured scraper in parallel and return the combined results.
 *
 * Scrapers that are not configured (missing env vars) are skipped.
 * Individual scraper failures are caught so one broken scraper does not
 * block the others.
 */
export async function runAllScrapers(
  keywords: string[],
  options?: SchedulerOptions,
): Promise<SchedulerResult> {
  const startTime = Date.now();

  const allScrapers = [
    // Always available (no auth needed)
    new RssScraper({
      language: options?.language,
      cantons: options?.cantons,
    }),
    new HackerNewsScraper(),

    // ScrapeCreators-powered (one key covers all three)
    new RedditScraper(),
    new TikTokScraper(),
    new InstagramScraper(),

    // bird cookie auth (free) or Twitter API v2 (paid fallback)
    new TwitterScraper(),

    // Free API key
    new YouTubeScraper(),

    // Meta Graph API (free, needs app review)
    new FacebookScraper(),
  ];

  const configured = allScrapers.filter((s) => {
    if (!s.isConfigured()) return false;
    if (options?.enabledPlatforms && !options.enabledPlatforms.includes(s.platform)) return false;
    return true;
  });

  console.log(
    `[Scheduler] Running ${configured.length}/${allScrapers.length} configured scrapers: ${configured.map(s => s.name).join(', ')}`,
  );

  const results = await Promise.allSettled(
    configured.map((scraper) =>
      scraper.scrape(keywords).then((items) => {
        console.log(
          `[Scheduler] ${scraper.name} returned ${items.length} items`,
        );
        return { name: scraper.name, platform: scraper.platform, items };
      }),
    ),
  );

  const combined: ScrapedItem[] = [];
  const breakdown: Record<string, number> = {};
  const errors: { scraper: string; error: string }[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      combined.push(...result.value.items);
      breakdown[result.value.platform] = (breakdown[result.value.platform] || 0) + result.value.items.length;
    } else {
      const scraperName = configured[i].name;
      const errorMsg = result.reason instanceof Error
        ? result.reason.message
        : String(result.reason);
      errors.push({ scraper: scraperName, error: errorMsg });
      console.error(`[Scheduler] ${scraperName} failed:`, errorMsg);
    }
  }

  // Deduplicate across platforms by externalId
  const seen = new Set<string>();
  const deduped: ScrapedItem[] = [];
  for (const item of combined) {
    const key = `${item.platform}:${item.externalId}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  // Sort by most recent first
  deduped.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  );

  const durationMs = Date.now() - startTime;
  console.log(
    `[Scheduler] Done in ${durationMs}ms — ${combined.length} raw, ${deduped.length} deduped, ${errors.length} errors`,
  );

  return {
    items: deduped,
    breakdown,
    errors,
    durationMs,
  };
}
