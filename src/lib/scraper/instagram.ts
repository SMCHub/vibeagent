// ---------------------------------------------------------------------------
// Instagram Scraper -- ScrapeCreators API integration
// ---------------------------------------------------------------------------
// Requires:
//   SCRAPECREATORS_API_KEY -- API key for scrapecreators.com
//
// Uses the ScrapeCreators Reels Search endpoint to find Instagram reels by
// keyword. Much simpler than the Graph API -- no hashtag ID resolution, no
// business discovery, no 30-searches-per-week limit.
// ---------------------------------------------------------------------------

import type { BaseScraper, ScrapedItem } from './base';
import { SOCIAL_MEDIA_TARGETS } from '@/lib/sources/switzerland';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCRAPECREATORS_BASE = 'https://api.scrapecreators.com/v2';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const RATE_LIMIT_DELAY_MS = 200;

// ---------------------------------------------------------------------------
// ScrapeCreators response types (the API can return varied shapes)
// ---------------------------------------------------------------------------

interface SCReel {
  // ID fields -- API may use either
  id?: string;
  pk?: string;
  // Shortcode / code for building the reel URL
  shortcode?: string;
  code?: string;
  // Caption can be a plain string or an object with a `text` field
  caption?: string | { text: string };
  // Timestamp: ISO string or unix epoch
  taken_at?: string | number;
  // Engagement metrics -- naming varies across responses
  video_play_count?: number;
  play_count?: number;
  like_count?: number;
  comment_count?: number;
  // Owner / user info
  owner?: { username?: string };
  user?: { username?: string };
  // Some responses include a direct URL
  url?: string;
}

interface SCReelsResponse {
  reels?: SCReel[];
  items?: SCReel[];
  data?: SCReel[];
}

// ---------------------------------------------------------------------------
// Helper: delay for rate-limiting
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Helper: authenticated fetch against ScrapeCreators API
// ---------------------------------------------------------------------------

async function scrapecreatorsFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T | null> {
  const apiKey = process.env.SCRAPECREATORS_API_KEY;
  if (!apiKey) return null;

  const url = new URL(`${SCRAPECREATORS_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: { 'x-api-key': apiKey },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(
        `[InstagramScraper] ScrapeCreators ${response.status} ${response.statusText} -- ${body}`,
      );
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.error('[InstagramScraper] ScrapeCreators fetch error:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: extract caption text from varied formats
// ---------------------------------------------------------------------------

function extractCaption(reel: SCReel): string {
  if (!reel.caption) return '';
  if (typeof reel.caption === 'string') return reel.caption;
  return reel.caption.text ?? '';
}

// ---------------------------------------------------------------------------
// Helper: parse `taken_at` -- ISO string or unix timestamp
// ---------------------------------------------------------------------------

function parseTakenAt(takenAt: string | number | undefined): Date {
  if (takenAt === undefined) return new Date();

  if (typeof takenAt === 'string') {
    const parsed = new Date(takenAt);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  if (typeof takenAt === 'number') {
    // If the number looks like seconds (< 1e12), convert to ms
    const ms = takenAt < 1e12 ? takenAt * 1000 : takenAt;
    return new Date(ms);
  }

  return new Date();
}

// ---------------------------------------------------------------------------
// Helper: extract reels array from varied response shapes
// ---------------------------------------------------------------------------

function extractReels(response: SCReelsResponse): SCReel[] {
  return response.reels ?? response.items ?? response.data ?? [];
}

// ---------------------------------------------------------------------------
// Helper: get reel ID from varied field names
// ---------------------------------------------------------------------------

function getReelId(reel: SCReel): string {
  return reel.id ?? reel.pk ?? '';
}

// ---------------------------------------------------------------------------
// Helper: get reel shortcode from varied field names
// ---------------------------------------------------------------------------

function getShortcode(reel: SCReel): string {
  return reel.shortcode ?? reel.code ?? '';
}

// ---------------------------------------------------------------------------
// Helper: get username from owner or user object
// ---------------------------------------------------------------------------

function getUsername(reel: SCReel): string {
  return reel.owner?.username ?? reel.user?.username ?? 'unknown';
}

// ---------------------------------------------------------------------------
// Helper: compute total engagement
// ---------------------------------------------------------------------------

function getEngagement(reel: SCReel): number {
  const plays = reel.video_play_count ?? reel.play_count ?? 0;
  const likes = reel.like_count ?? 0;
  const comments = reel.comment_count ?? 0;
  return plays + likes + comments;
}

// ---------------------------------------------------------------------------
// Helper: get views/plays for sorting
// ---------------------------------------------------------------------------

function getViews(reel: SCReel): number {
  return reel.video_play_count ?? reel.play_count ?? 0;
}

// ---------------------------------------------------------------------------
// InstagramScraper
// ---------------------------------------------------------------------------

export class InstagramScraper implements BaseScraper {
  name = 'Instagram';
  platform = 'instagram' as const;

  // -------------------------------------------------------------------------
  // isConfigured
  // -------------------------------------------------------------------------

  isConfigured(): boolean {
    return !!process.env.SCRAPECREATORS_API_KEY;
  }

  // -------------------------------------------------------------------------
  // Main scrape method
  // -------------------------------------------------------------------------

  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    if (!this.isConfigured()) {
      console.warn('[InstagramScraper] Not configured (missing SCRAPECREATORS_API_KEY) -- skipping');
      return [];
    }

    if (keywords.length === 0) {
      console.warn('[InstagramScraper] No keywords provided -- skipping');
      return [];
    }

    // Build the search terms from SOCIAL_MEDIA_TARGETS (instagram hashtags)
    // plus the provided keywords
    const instagramTargets = SOCIAL_MEDIA_TARGETS.filter(
      (t) => t.platform === 'instagram',
    );

    // Collect unique search queries: hashtag identifiers + provided keywords
    const searchQueries = new Set<string>();

    for (const target of instagramTargets) {
      if (target.type === 'hashtag') {
        searchQueries.add(target.identifier);
      }
    }
    for (const kw of keywords) {
      searchQueries.add(kw);
    }

    const queries = Array.from(searchQueries);

    console.log(
      `[InstagramScraper] Searching ${queries.length} queries via ScrapeCreators: ${queries.join(', ')}`,
    );

    const allReels: SCReel[] = [];
    const now = Date.now();

    // Fetch reels for each query
    for (const query of queries) {
      try {
        const response = await scrapecreatorsFetch<SCReelsResponse>(
          '/instagram/reels/search',
          { query },
        );

        if (response) {
          const reels = extractReels(response);
          console.log(
            `[InstagramScraper] Query "${query}": ${reels.length} reels returned`,
          );
          allReels.push(...reels);
        }
      } catch (err) {
        console.error(
          `[InstagramScraper] Error searching "${query}":`,
          err,
        );
      }

      // Rate-limit between API calls
      await delay(RATE_LIMIT_DELAY_MS);
    }

    // Filter, deduplicate, and map results
    const seen = new Set<string>();
    const results: ScrapedItem[] = [];

    // Sort by views/plays descending before processing
    allReels.sort((a, b) => getViews(b) - getViews(a));

    for (const reel of allReels) {
      const reelId = getReelId(reel);
      if (!reelId || seen.has(reelId)) continue;

      const caption = extractCaption(reel);
      const publishedAt = parseTakenAt(reel.taken_at);

      // Skip reels older than 30 days
      if (now - publishedAt.getTime() > THIRTY_DAYS_MS) continue;

      // Filter: caption must contain at least one keyword (case-insensitive)
      const captionLower = caption.toLowerCase();
      const matchesKeyword = keywords.some((kw) =>
        captionLower.includes(kw.toLowerCase()),
      );
      if (!matchesKeyword) continue;

      seen.add(reelId);

      const username = getUsername(reel);
      const shortcode = getShortcode(reel);
      const reelUrl =
        reel.url ??
        (shortcode
          ? `https://www.instagram.com/reel/${shortcode}`
          : `https://www.instagram.com/reel/${reelId}`);

      const title =
        caption.length > 100 ? caption.slice(0, 100) + '...' : caption;

      results.push({
        externalId: reelId,
        title,
        content: caption,
        author: username,
        authorUrl: `https://www.instagram.com/${username}/`,
        url: reelUrl,
        platform: 'instagram',
        publishedAt,
        engagementCount: getEngagement(reel),
      });
    }

    console.log(
      `[InstagramScraper] Done -- ${results.length} unique reels collected`,
    );

    return results;
  }
}
