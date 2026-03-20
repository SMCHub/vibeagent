// ---------------------------------------------------------------------------
// Reddit Scraper -- ScrapeCreators API integration
// ---------------------------------------------------------------------------
// Requires:
//   SCRAPECREATORS_API_KEY -- API key for scrapecreators.com
// ---------------------------------------------------------------------------

import type { BaseScraper, ScrapedItem } from './base';
import { SOCIAL_MEDIA_TARGETS } from '@/lib/sources/switzerland';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.scrapecreators.com/v1/reddit';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const RATE_LIMIT_MS = 200;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_CONTENT_LENGTH = 500;

// ---------------------------------------------------------------------------
// Types for ScrapeCreators Reddit API responses
// ---------------------------------------------------------------------------

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  author: string;
  permalink: string;
  ups?: number;
  score?: number;
  num_comments: number;
  created_utc: number;
  upvote_ratio?: number;
}

interface ScrapeCreatorsSearchResponse {
  posts?: RedditPost[];
  data?: RedditPost[];
}

// ---------------------------------------------------------------------------
// Helper: small delay for rate-limiting
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Helper: reusable fetch with x-api-key header, timeout, error handling
// ---------------------------------------------------------------------------

async function scrapecreatorsFetch<T>(
  endpoint: string,
  params: Record<string, string>,
): Promise<T | null> {
  const apiKey = process.env.SCRAPECREATORS_API_KEY;
  if (!apiKey) {
    console.error('[RedditScraper] Missing SCRAPECREATORS_API_KEY');
    return null;
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(
        `[RedditScraper] ${endpoint} => ${response.status} ${response.statusText}`,
      );
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn(`[RedditScraper] ${endpoint} timed out after ${FETCH_TIMEOUT_MS}ms`);
    } else {
      console.warn(`[RedditScraper] ${endpoint} error:`, err);
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: extract posts array from response (handles both shapes)
// ---------------------------------------------------------------------------

function extractPosts(response: ScrapeCreatorsSearchResponse | null): RedditPost[] {
  if (!response) return [];
  return response.posts ?? response.data ?? [];
}

// ---------------------------------------------------------------------------
// RedditScraper
// ---------------------------------------------------------------------------

export class RedditScraper implements BaseScraper {
  name = 'Reddit (ScrapeCreators)';
  platform = 'reddit' as const;

  // -------------------------------------------------------------------------
  // isConfigured
  // -------------------------------------------------------------------------

  isConfigured(): boolean {
    return !!process.env.SCRAPECREATORS_API_KEY;
  }

  // -------------------------------------------------------------------------
  // Map a raw Reddit post to ScrapedItem
  // -------------------------------------------------------------------------

  private mapPost(post: RedditPost): ScrapedItem {
    const rawContent = post.selftext || post.title;
    const content =
      rawContent.length > MAX_CONTENT_LENGTH
        ? rawContent.slice(0, MAX_CONTENT_LENGTH)
        : rawContent;

    const score = post.score ?? post.ups ?? 0;

    return {
      externalId: post.id,
      title: post.title,
      content,
      author: post.author,
      authorUrl: `https://www.reddit.com/user/${post.author}`,
      url: `https://www.reddit.com${post.permalink}`,
      platform: 'reddit',
      publishedAt: new Date(post.created_utc * 1000),
      engagementCount: score + (post.num_comments ?? 0),
    };
  }

  // -------------------------------------------------------------------------
  // Main scrape method
  // -------------------------------------------------------------------------

  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    if (!this.isConfigured()) {
      console.warn('[RedditScraper] Not configured -- skipping');
      return [];
    }

    if (keywords.length === 0) {
      console.warn('[RedditScraper] No keywords provided -- skipping');
      return [];
    }

    console.log(
      `[RedditScraper] Starting scrape for keywords: ${keywords.join(', ')}`,
    );

    // Collect all raw posts before dedup
    const allPosts: RedditPost[] = [];

    // ---------------------------------------------------------------------
    // Phase 1: Global Search -- for each keyword, call global search
    // ---------------------------------------------------------------------

    console.log('[RedditScraper] Phase 1: Global search');

    for (const keyword of keywords) {
      const response = await scrapecreatorsFetch<ScrapeCreatorsSearchResponse>(
        '/search',
        { query: keyword, sort: 'relevance', timeframe: 'month' },
      );

      const posts = extractPosts(response);
      allPosts.push(...posts);

      console.log(
        `[RedditScraper]   Global search "${keyword}": ${posts.length} posts`,
      );

      await delay(RATE_LIMIT_MS);
    }

    // ---------------------------------------------------------------------
    // Phase 2: Subreddit Discovery -- find top subreddits from global
    //          results + configured Switzerland targets
    // ---------------------------------------------------------------------

    console.log('[RedditScraper] Phase 2: Subreddit discovery');

    const redditTargets = SOCIAL_MEDIA_TARGETS.filter(
      (t) => t.platform === 'reddit',
    );
    const targetSubreddits = new Set(
      redditTargets.map((t) => t.identifier.toLowerCase()),
    );

    // Also collect subreddits discovered from global results
    const discoveredSubreddits = new Set<string>();
    for (const post of allPosts) {
      if (post.subreddit) {
        const subLower = post.subreddit.toLowerCase();
        // Only add if it matches one of our target subreddits
        if (targetSubreddits.has(subLower)) {
          discoveredSubreddits.add(post.subreddit);
        }
      }
    }

    // Merge: use all configured targets
    const subredditsToSearch = new Set<string>(
      redditTargets.map((t) => t.identifier),
    );
    // Plus any discovered ones (preserving original casing from the API)
    for (const sub of discoveredSubreddits) {
      subredditsToSearch.add(sub);
    }

    console.log(
      `[RedditScraper]   Subreddits to search: ${[...subredditsToSearch].join(', ')}`,
    );

    // ---------------------------------------------------------------------
    // Phase 3: Targeted Subreddit Search -- search each subreddit
    // ---------------------------------------------------------------------

    console.log('[RedditScraper] Phase 3: Targeted subreddit search');

    for (const subreddit of subredditsToSearch) {
      for (const keyword of keywords) {
        const response = await scrapecreatorsFetch<ScrapeCreatorsSearchResponse>(
          '/subreddit/search',
          {
            subreddit,
            query: keyword,
            sort: 'relevance',
            timeframe: 'month',
          },
        );

        const posts = extractPosts(response);
        allPosts.push(...posts);

        console.log(
          `[RedditScraper]   r/${subreddit} "${keyword}": ${posts.length} posts`,
        );

        await delay(RATE_LIMIT_MS);
      }
    }

    // ---------------------------------------------------------------------
    // Phase 4: Dedup -- by reddit post id and URL
    // ---------------------------------------------------------------------

    console.log('[RedditScraper] Phase 4: Deduplication');

    const seenIds = new Set<string>();
    const seenUrls = new Set<string>();
    const uniquePosts: RedditPost[] = [];

    for (const post of allPosts) {
      if (!post.id || !post.permalink) continue;

      const url = `https://www.reddit.com${post.permalink}`;

      if (seenIds.has(post.id) || seenUrls.has(url)) continue;

      seenIds.add(post.id);
      seenUrls.add(url);
      uniquePosts.push(post);
    }

    console.log(
      `[RedditScraper]   ${allPosts.length} total => ${uniquePosts.length} unique`,
    );

    // ---------------------------------------------------------------------
    // Phase 5: Date filter -- skip posts older than 30 days
    // ---------------------------------------------------------------------

    console.log('[RedditScraper] Phase 5: Date filtering (30 days)');

    const cutoffMs = Date.now() - THIRTY_DAYS_MS;
    const recentPosts = uniquePosts.filter((post) => {
      const postMs = post.created_utc * 1000;
      return postMs >= cutoffMs;
    });

    console.log(
      `[RedditScraper]   ${uniquePosts.length} unique => ${recentPosts.length} within 30 days`,
    );

    // ---------------------------------------------------------------------
    // Phase 6: Sort -- by score descending
    // ---------------------------------------------------------------------

    console.log('[RedditScraper] Phase 6: Sorting by score');

    recentPosts.sort((a, b) => {
      const scoreA = (a.score ?? a.ups ?? 0) + (a.num_comments ?? 0);
      const scoreB = (b.score ?? b.ups ?? 0) + (b.num_comments ?? 0);
      return scoreB - scoreA;
    });

    // Map to ScrapedItem
    const results = recentPosts.map((post) => this.mapPost(post));

    console.log(
      `[RedditScraper] Done -- ${results.length} posts collected`,
    );

    return results;
  }
}
