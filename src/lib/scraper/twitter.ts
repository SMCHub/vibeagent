// ---------------------------------------------------------------------------
// Twitter / X Scraper -- Dual Auth (Cookie + Bearer Token)
// ---------------------------------------------------------------------------
// Two authentication strategies:
//   1. PRIMARY (FREE): Cookie auth via @steipete/bird library
//      Env vars: TWITTER_AUTH_TOKEN + TWITTER_CT0
//   2. FALLBACK (paid): Bearer token via Twitter API v2 Recent Search
//      Env var:  TWITTER_BEARER_TOKEN
//
// isConfigured() returns true if EITHER auth method is available.
// ---------------------------------------------------------------------------

import type { BaseScraper, ScrapedItem } from './base';
import { SOCIAL_MEDIA_TARGETS } from '@/lib/sources/switzerland';

// ---------------------------------------------------------------------------
// Twitter API v2 response types (for bearer token fallback)
// ---------------------------------------------------------------------------

interface TwitterUser {
  id: string;
  name: string;
  username: string;
}

interface TwitterPublicMetrics {
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
}

interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at?: string;
  public_metrics?: TwitterPublicMetrics;
}

interface TwitterSearchResponse {
  data?: TwitterTweet[];
  includes?: {
    users?: TwitterUser[];
  };
  meta?: {
    result_count: number;
    newest_id?: string;
    oldest_id?: string;
    next_token?: string;
  };
  errors?: Array<{ message: string; type: string }>;
}

// ---------------------------------------------------------------------------
// Bird library types (for cookie auth)
// ---------------------------------------------------------------------------

interface BirdTweetAuthor {
  username: string;
  name: string;
}

interface BirdTweetData {
  id: string;
  text: string;
  author: BirdTweetAuthor;
  createdAt?: string;
  replyCount?: number;
  retweetCount?: number;
  likeCount?: number;
}

interface BirdSearchResult {
  success: boolean;
  tweets?: BirdTweetData[];
  error?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TWITTER_SEARCH_URL = 'https://api.twitter.com/2/tweets/search/recent';
const MAX_QUERY_LENGTH = 1024;
const MAX_RESULTS = 100;
const FETCH_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Bird client factory (dynamic import for ESM-only package)
// ---------------------------------------------------------------------------

/**
 * Dynamically import and instantiate the bird TwitterClient.
 * We use dynamic import because @steipete/bird is ESM-only.
 *
 * The TwitterCookies interface requires all four fields:
 *   authToken, ct0, cookieHeader, source
 * We construct the cookieHeader from the raw tokens and mark source as "env".
 */
async function createBirdClient(authToken: string, ct0: string) {
  const { TwitterClient } = await import(
    '@steipete/bird/dist/lib/twitter-client.js'
  );
  return new TwitterClient({
    cookies: {
      authToken,
      ct0,
      cookieHeader: `auth_token=${authToken}; ct0=${ct0}`,
      source: 'env',
    },
    timeoutMs: FETCH_TIMEOUT_MS,
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch with a hard timeout using AbortController.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Get the list of Swiss Twitter account usernames from SOCIAL_MEDIA_TARGETS.
 */
function getSwissTwitterUsernames(): string[] {
  return SOCIAL_MEDIA_TARGETS
    .filter((t) => t.platform === 'twitter')
    .map((t) => t.identifier);
}

/**
 * Build search queries from keywords and Swiss account identifiers.
 *
 * Strategy:
 *  - Base keyword clause: `(kw1 OR kw2 OR ...)`.
 *  - Account clause: `(from:user1 OR from:user2 OR ...)`.
 *  - Suffix: `lang:de -is:retweet`.
 *  - Combined: `<keywords> <accounts> <suffix>`.
 *
 * If the combined query exceeds 1024 chars we split into smaller batches
 * (fewer accounts per query) until each chunk fits.
 */
function buildQueries(keywords: string[]): string[] {
  if (keywords.length === 0) return [];

  const suffix = 'lang:de -is:retweet';
  const keywordClause = `(${keywords.join(' OR ')})`;
  const usernames = getSwissTwitterUsernames();

  // If no accounts configured, just search keywords
  if (usernames.length === 0) {
    const query = `${keywordClause} ${suffix}`;
    return query.length <= MAX_QUERY_LENGTH
      ? [query]
      : splitKeywordQueries(keywords, suffix);
  }

  // Try the full combined query first
  const fullAccountClause = `(${usernames.map((u) => `from:${u}`).join(' OR ')})`;
  const fullQuery = `${keywordClause} ${fullAccountClause} ${suffix}`;

  if (fullQuery.length <= MAX_QUERY_LENGTH) {
    return [fullQuery];
  }

  // Query too long -- split accounts into batches
  const queries: string[] = [];
  let batch: string[] = [];

  for (const username of usernames) {
    batch.push(username);
    const accountClause = `(${batch.map((u) => `from:${u}`).join(' OR ')})`;
    const candidate = `${keywordClause} ${accountClause} ${suffix}`;

    if (candidate.length > MAX_QUERY_LENGTH) {
      // Remove the username that caused overflow, flush current batch
      batch.pop();
      if (batch.length > 0) {
        const ac = `(${batch.map((u) => `from:${u}`).join(' OR ')})`;
        queries.push(`${keywordClause} ${ac} ${suffix}`);
      }
      batch = [username];
    }
  }

  // Flush remaining batch
  if (batch.length > 0) {
    const ac = `(${batch.map((u) => `from:${u}`).join(' OR ')})`;
    queries.push(`${keywordClause} ${ac} ${suffix}`);
  }

  // If we somehow couldn't fit even a single account, fall back to keyword-only
  if (queries.length === 0) {
    return splitKeywordQueries(keywords, suffix);
  }

  return queries;
}

/**
 * Split keyword-only queries if even those exceed the max length.
 */
function splitKeywordQueries(keywords: string[], suffix: string): string[] {
  const queries: string[] = [];
  let batch: string[] = [];

  for (const kw of keywords) {
    batch.push(kw);
    const candidate = `(${batch.join(' OR ')}) ${suffix}`;
    if (candidate.length > MAX_QUERY_LENGTH) {
      batch.pop();
      if (batch.length > 0) {
        queries.push(`(${batch.join(' OR ')}) ${suffix}`);
      }
      batch = [kw];
    }
  }

  if (batch.length > 0) {
    queries.push(`(${batch.join(' OR ')}) ${suffix}`);
  }

  return queries;
}

/**
 * Compute total engagement from Twitter API v2 public metrics.
 */
function computeEngagement(metrics?: TwitterPublicMetrics): number {
  if (!metrics) return 0;
  return (
    metrics.retweet_count +
    metrics.like_count +
    metrics.reply_count +
    metrics.quote_count
  );
}

// ---------------------------------------------------------------------------
// Auth detection helpers
// ---------------------------------------------------------------------------

function hasCookieAuth(): boolean {
  return !!(process.env.TWITTER_AUTH_TOKEN && process.env.TWITTER_CT0);
}

function hasBearerAuth(): boolean {
  return !!process.env.TWITTER_BEARER_TOKEN;
}

// ---------------------------------------------------------------------------
// TwitterScraper
// ---------------------------------------------------------------------------

export class TwitterScraper implements BaseScraper {
  name = 'Twitter / X';
  platform = 'twitter' as const;

  /**
   * Returns true if EITHER cookie pair (free) OR bearer token (paid) is set.
   */
  isConfigured(): boolean {
    return hasCookieAuth() || hasBearerAuth();
  }

  /**
   * Scrape tweets matching keywords. Tries cookie auth first (free via
   * @steipete/bird), then falls back to bearer token (paid Twitter API v2).
   */
  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    if (!this.isConfigured()) {
      console.warn(
        '[TwitterScraper] No auth configured. Set TWITTER_AUTH_TOKEN + TWITTER_CT0 (free) or TWITTER_BEARER_TOKEN (paid). Skipping.',
      );
      return [];
    }

    if (keywords.length === 0) {
      console.warn('[TwitterScraper] No keywords provided -- skipping.');
      return [];
    }

    // Primary: cookie auth via bird library (FREE)
    if (hasCookieAuth()) {
      console.log('[TwitterScraper] Using cookie auth (bird library) -- FREE tier.');
      try {
        const items = await this.scrapeWithCookies(keywords);
        if (items.length > 0) {
          return items;
        }
        console.warn(
          '[TwitterScraper] Cookie auth returned 0 results. Trying bearer fallback if available.',
        );
      } catch (err) {
        console.error(
          '[TwitterScraper] Cookie auth failed. Trying bearer fallback if available.',
          err,
        );
      }
    }

    // Fallback: bearer token via Twitter API v2 (paid)
    if (hasBearerAuth()) {
      console.log('[TwitterScraper] Using bearer token auth (Twitter API v2) -- paid tier.');
      try {
        return await this.scrapeWithBearer(keywords);
      } catch (err) {
        console.error('[TwitterScraper] Bearer token auth failed.', err);
      }
    }

    console.warn('[TwitterScraper] All auth methods exhausted. Returning empty results.');
    return [];
  }

  // -------------------------------------------------------------------------
  // Cookie auth path (bird library)
  // -------------------------------------------------------------------------

  private async scrapeWithCookies(keywords: string[]): Promise<ScrapedItem[]> {
    const authToken = process.env.TWITTER_AUTH_TOKEN!;
    const ct0 = process.env.TWITTER_CT0!;

    const client = await createBirdClient(authToken, ct0);

    const queries = buildQueries(keywords);
    console.log(
      `[TwitterScraper][bird] Searching with ${queries.length} query batch(es) for ${keywords.length} keyword(s).`,
    );

    const allItems: ScrapedItem[] = [];
    const seenIds = new Set<string>();

    for (const query of queries) {
      try {
        const result: BirdSearchResult = await client.search(query, MAX_RESULTS);

        if (!result.success) {
          console.warn(
            `[TwitterScraper][bird] Search unsuccessful: ${result.error ?? 'unknown error'}`,
          );
          continue;
        }

        if (!result.tweets || result.tweets.length === 0) {
          continue;
        }

        for (const tweet of result.tweets) {
          if (seenIds.has(tweet.id)) continue;
          seenIds.add(tweet.id);
          allItems.push(this.mapBirdTweet(tweet));
        }
      } catch (err) {
        console.error(`[TwitterScraper][bird] Query failed: ${query}`, err);
        // Continue with remaining queries
      }
    }

    console.log(
      `[TwitterScraper][bird] Collected ${allItems.length} unique tweet(s).`,
    );
    return allItems;
  }

  /**
   * Map a bird TweetData object to a ScrapedItem.
   */
  private mapBirdTweet(tweet: BirdTweetData): ScrapedItem {
    const username = tweet.author?.username ?? 'unknown';

    const title =
      tweet.text.length > 100
        ? tweet.text.slice(0, 100) + '...'
        : tweet.text;

    const engagement =
      (tweet.retweetCount ?? 0) +
      (tweet.likeCount ?? 0) +
      (tweet.replyCount ?? 0);

    return {
      externalId: tweet.id,
      title,
      url: `https://x.com/${username}/status/${tweet.id}`,
      content: tweet.text,
      author: username,
      authorUrl: `https://x.com/${username}`,
      platform: 'twitter',
      publishedAt: tweet.createdAt
        ? new Date(tweet.createdAt)
        : new Date(),
      engagementCount: engagement,
    };
  }

  // -------------------------------------------------------------------------
  // Bearer token fallback path (Twitter API v2)
  // -------------------------------------------------------------------------

  private async scrapeWithBearer(keywords: string[]): Promise<ScrapedItem[]> {
    const queries = buildQueries(keywords);
    console.log(
      `[TwitterScraper][bearer] Searching with ${queries.length} query batch(es) for ${keywords.length} keyword(s).`,
    );

    const allItems: ScrapedItem[] = [];
    const seenIds = new Set<string>();

    for (const query of queries) {
      try {
        const items = await this.executeBearerSearch(query);

        for (const item of items) {
          if (!seenIds.has(item.externalId)) {
            seenIds.add(item.externalId);
            allItems.push(item);
          }
        }
      } catch (err) {
        console.error(`[TwitterScraper][bearer] Query failed: ${query}`, err);
        // Continue with remaining queries
      }
    }

    console.log(
      `[TwitterScraper][bearer] Collected ${allItems.length} unique tweet(s).`,
    );
    return allItems;
  }

  /**
   * Execute a single search query against the Twitter API v2 Recent Search
   * endpoint and map the response into ScrapedItem[].
   */
  private async executeBearerSearch(query: string): Promise<ScrapedItem[]> {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN!;

    const params = new URLSearchParams({
      query,
      max_results: String(MAX_RESULTS),
      'tweet.fields': 'public_metrics,created_at,author_id',
      'user.fields': 'name,username',
      expansions: 'author_id',
    });

    const url = `${TWITTER_SEARCH_URL}?${params.toString()}`;

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle rate limiting gracefully
    if (response.status === 429) {
      const resetHeader = response.headers.get('x-rate-limit-reset');
      const resetAt = resetHeader
        ? new Date(Number(resetHeader) * 1000).toISOString()
        : 'unknown';
      console.warn(
        `[TwitterScraper][bearer] Rate limited (429). Reset at: ${resetAt}. Returning empty results for this query.`,
      );
      return [];
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const body = await response.text().catch(() => '(no body)');
      console.error(
        `[TwitterScraper][bearer] API error ${response.status}: ${body}`,
      );
      return [];
    }

    const data: TwitterSearchResponse = await response.json();

    // Check for API-level errors
    if (data.errors && data.errors.length > 0) {
      console.warn(
        `[TwitterScraper][bearer] API returned errors:`,
        data.errors.map((e) => e.message).join('; '),
      );
    }

    // No results
    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Build a lookup map: author_id -> TwitterUser
    const userMap = new Map<string, TwitterUser>();
    if (data.includes?.users) {
      for (const user of data.includes.users) {
        userMap.set(user.id, user);
      }
    }

    // Map tweets to ScrapedItem[]
    return data.data.map((tweet): ScrapedItem => {
      const author = userMap.get(tweet.author_id);
      const username = author?.username ?? 'unknown';
      const displayName = author?.name ?? username;

      const title =
        tweet.text.length > 100
          ? tweet.text.slice(0, 100) + '...'
          : tweet.text;

      return {
        externalId: tweet.id,
        title,
        url: `https://x.com/${username}/status/${tweet.id}`,
        content: tweet.text,
        author: displayName,
        authorUrl: `https://x.com/${username}`,
        platform: 'twitter',
        publishedAt: tweet.created_at
          ? new Date(tweet.created_at)
          : new Date(),
        engagementCount: computeEngagement(tweet.public_metrics),
      };
    });
  }
}
