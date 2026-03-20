// ---------------------------------------------------------------------------
// Facebook Graph API Scraper
// ---------------------------------------------------------------------------
// Monitors Swiss political Facebook pages and groups via the Graph API.
//
// Env vars needed:
//   FACEBOOK_ACCESS_TOKEN -- Long-lived Page Access Token
//   FACEBOOK_APP_ID       -- Facebook App ID
//   FACEBOOK_APP_SECRET   -- Facebook App Secret
//
// NOTE: The Facebook Graph API does NOT support global keyword search.
// Instead we fetch feeds from specific pages/groups defined in
// SOCIAL_MEDIA_TARGETS and filter posts client-side by keyword.
// ---------------------------------------------------------------------------

import type { BaseScraper, ScrapedItem } from './base';
import { SOCIAL_MEDIA_TARGETS } from '@/lib/sources/switzerland';
import type { SocialMediaTarget } from '@/lib/sources/switzerland';

// ---------------------------------------------------------------------------
// Graph API response types
// ---------------------------------------------------------------------------

interface FacebookFrom {
  id: string;
  name: string;
}

interface FacebookReactionsSummary {
  total_count: number;
}

interface FacebookCommentsSummary {
  total_count: number;
}

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url?: string;
  from?: FacebookFrom;
  shares?: { count: number };
  reactions?: { summary: FacebookReactionsSummary };
  comments?: { summary: FacebookCommentsSummary };
}

interface FacebookFeedResponse {
  data?: FacebookPost[];
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_VERSION = 'v19.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
const FIELDS = [
  'message',
  'created_time',
  'shares',
  'reactions.summary(true)',
  'comments.summary(true)',
  'permalink_url',
  'from',
].join(',');
const POSTS_PER_PAGE = 25;
const RATE_LIMIT_DELAY_MS = 200;
const MAX_AGE_DAYS = 7;

// ---------------------------------------------------------------------------
// FacebookScraper
// ---------------------------------------------------------------------------

export class FacebookScraper implements BaseScraper {
  name = 'Facebook';
  platform = 'facebook' as const;

  // -------------------------------------------------------------------------
  // Configuration check
  // -------------------------------------------------------------------------

  isConfigured(): boolean {
    return !!(
      process.env.FACEBOOK_ACCESS_TOKEN &&
      process.env.FACEBOOK_APP_ID &&
      process.env.FACEBOOK_APP_SECRET
    );
  }

  // -------------------------------------------------------------------------
  // Main scrape entry point
  // -------------------------------------------------------------------------

  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    if (!this.isConfigured()) {
      console.warn('[FacebookScraper] Missing API credentials — skipping.');
      return [];
    }

    if (keywords.length === 0) {
      console.warn('[FacebookScraper] No keywords provided — skipping.');
      return [];
    }

    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN!;

    // Validate the token with a simple /me call before iterating pages
    const tokenValid = await this.validateToken(accessToken);
    if (!tokenValid) {
      console.error(
        '[FacebookScraper] Access token is invalid or expired — returning empty.',
      );
      return [];
    }

    const targets = SOCIAL_MEDIA_TARGETS.filter(
      (t) => t.platform === 'facebook',
    );

    console.log(
      `[FacebookScraper] Fetching feeds from ${targets.length} pages/groups for keywords: ${keywords.join(', ')}`,
    );

    const allItems: ScrapedItem[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);

    const lowercaseKeywords = keywords.map((k) => k.toLowerCase());

    for (const target of targets) {
      try {
        const posts = await this.fetchPageFeed(target.identifier, accessToken);

        for (const post of posts) {
          // Skip posts without a message
          if (!post.message) continue;

          // Skip posts older than 7 days
          const publishedAt = new Date(post.created_time);
          if (publishedAt < cutoffDate) continue;

          // Keyword match (case-insensitive)
          const messageLower = post.message.toLowerCase();
          const matchesKeyword = lowercaseKeywords.some((kw) =>
            messageLower.includes(kw),
          );
          if (!matchesKeyword) continue;

          allItems.push(this.mapToScrapedItem(post, target));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : String(err);
        console.error(
          `[FacebookScraper] Error fetching feed for "${target.name}" (${target.identifier}): ${errorMessage}`,
        );
        // Continue with next target
      }

      // Rate limiting: 200ms delay between page requests
      await this.delay(RATE_LIMIT_DELAY_MS);
    }

    console.log(
      `[FacebookScraper] Scraped ${allItems.length} matching posts from ${targets.length} targets.`,
    );

    return allItems;
  }

  // -------------------------------------------------------------------------
  // Fetch a single page/group feed
  // -------------------------------------------------------------------------

  private async fetchPageFeed(
    identifier: string,
    accessToken: string,
  ): Promise<FacebookPost[]> {
    const url = new URL(`${BASE_URL}/${encodeURIComponent(identifier)}/feed`);
    url.searchParams.set('fields', FIELDS);
    url.searchParams.set('limit', String(POSTS_PER_PAGE));
    url.searchParams.set('access_token', accessToken);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `HTTP ${response.status} from Graph API for ${identifier}: ${body}`,
      );
    }

    const json = (await response.json()) as FacebookFeedResponse;

    if (json.error) {
      throw new Error(
        `Graph API error for ${identifier}: [${json.error.code}] ${json.error.type} — ${json.error.message}`,
      );
    }

    return json.data ?? [];
  }

  // -------------------------------------------------------------------------
  // Map a Graph API post to ScrapedItem
  // -------------------------------------------------------------------------

  private mapToScrapedItem(
    post: FacebookPost,
    target: SocialMediaTarget,
  ): ScrapedItem {
    const message = post.message ?? '';

    const reactionsCount = post.reactions?.summary?.total_count ?? 0;
    const commentsCount = post.comments?.summary?.total_count ?? 0;
    const sharesCount = post.shares?.count ?? 0;

    return {
      externalId: post.id,
      title:
        message.length > 100 ? message.substring(0, 100) + '...' : message,
      content: message,
      author: post.from?.name ?? target.name,
      authorUrl: `https://www.facebook.com/${target.identifier}`,
      url:
        post.permalink_url ??
        `https://www.facebook.com/${post.id}`,
      platform: 'facebook',
      publishedAt: new Date(post.created_time),
      engagementCount: reactionsCount + commentsCount + sharesCount,
    };
  }

  // -------------------------------------------------------------------------
  // Validate the access token before making bulk requests
  // -------------------------------------------------------------------------

  private async validateToken(accessToken: string): Promise<boolean> {
    try {
      const url = new URL(`${BASE_URL}/me`);
      url.searchParams.set('access_token', accessToken);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.error(
          `[FacebookScraper] Token validation failed: HTTP ${response.status} — ${body}`,
        );
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      console.error(
        `[FacebookScraper] Token validation error: ${errorMessage}`,
      );
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // Utility: delay for rate limiting
  // -------------------------------------------------------------------------

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
