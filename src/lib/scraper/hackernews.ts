// ---------------------------------------------------------------------------
// Hacker News Scraper -- Algolia HN API (free, no auth required)
// ---------------------------------------------------------------------------
// Uses: https://hn.algolia.com/api/v1/search
// No API key needed.

import type { BaseScraper, ScrapedItem } from './base';

// ---------------------------------------------------------------------------
// Algolia HN API types (partial, only what we use)
// ---------------------------------------------------------------------------

interface AlgoliaHit {
  objectID: string;
  title: string;
  url: string | null;
  author: string;
  points: number;
  num_comments: number;
  created_at_i: number;
}

interface AlgoliaSearchResponse {
  hits: AlgoliaHit[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THIRTY_DAYS_S = 30 * 24 * 60 * 60;

// ---------------------------------------------------------------------------
// HackerNewsScraper
// ---------------------------------------------------------------------------

export class HackerNewsScraper implements BaseScraper {
  name = 'Hacker News';
  platform = 'news' as const;

  // -------------------------------------------------------------------------
  // isConfigured -- always true; Algolia HN API is free with no auth
  // -------------------------------------------------------------------------

  isConfigured(): boolean {
    return true;
  }

  // -------------------------------------------------------------------------
  // Check if a story title matches at least one keyword (case-insensitive)
  // -------------------------------------------------------------------------

  private matchesKeywords(hit: AlgoliaHit, keywords: string[]): boolean {
    const titleLower = hit.title.toLowerCase();
    return keywords.some((kw) => titleLower.includes(kw.toLowerCase()));
  }

  // -------------------------------------------------------------------------
  // Map an Algolia hit to ScrapedItem
  // -------------------------------------------------------------------------

  private mapHit(hit: AlgoliaHit): ScrapedItem {
    return {
      externalId: hit.objectID,
      title: hit.title,
      content: hit.title,
      author: hit.author,
      authorUrl: `https://news.ycombinator.com/user?id=${hit.author}`,
      url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
      platform: 'news',
      publishedAt: new Date(hit.created_at_i * 1000),
      engagementCount: (hit.points || 0) + (hit.num_comments || 0),
    };
  }

  // -------------------------------------------------------------------------
  // Main scrape method
  // -------------------------------------------------------------------------

  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    if (keywords.length === 0) {
      console.warn('[HackerNewsScraper] No keywords provided -- skipping');
      return [];
    }

    const query = encodeURIComponent(keywords.join(' '));
    const fromTimestamp = Math.floor(Date.now() / 1000) - THIRTY_DAYS_S;

    const url =
      `https://hn.algolia.com/api/v1/search` +
      `?query=${query}` +
      `&tags=story` +
      `&numericFilters=created_at_i>${fromTimestamp},points>2` +
      `&hitsPerPage=30`;

    console.log(
      `[HackerNewsScraper] Searching for keywords: ${keywords.join(', ')}`,
    );

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error(
          `[HackerNewsScraper] API error: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const data = (await response.json()) as AlgoliaSearchResponse;

      if (!data.hits || data.hits.length === 0) {
        console.log('[HackerNewsScraper] No stories found');
        return [];
      }

      // Client-side keyword filter (Algolia does server-side, but double-check)
      const filtered = data.hits.filter((hit) =>
        this.matchesKeywords(hit, keywords),
      );

      // Sort by points descending
      filtered.sort((a, b) => (b.points || 0) - (a.points || 0));

      const results = filtered.map((hit) => this.mapHit(hit));

      console.log(
        `[HackerNewsScraper] Done -- ${results.length} stories collected`,
      );

      return results;
    } catch (err) {
      console.error('[HackerNewsScraper] Fetch error:', err);
      return [];
    }
  }
}
