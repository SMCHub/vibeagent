// ---------------------------------------------------------------------------
// RSS / News Feed Scraper -- Swiss News Edition
// ---------------------------------------------------------------------------
// Fully functional RSS scraper for Swiss regional and national news sources.
// No external XML parsing dependency -- uses regex for RSS 2.0 extraction.

import type { BaseScraper, ScrapedItem } from './base';
import {
  NEWS_SOURCES,
  GOOGLE_NEWS_GEO_FEEDS,
  getGoogleNewsFeed,
  type NewsSource,
} from '@/lib/sources/switzerland';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  creator: string;
}

interface RssScraperOptions {
  /** Which cantons to monitor (defaults to all available in geo feeds). */
  cantons?: string[];
  /** Primary language filter: 'de' | 'fr' | 'it' | 'rm' (defaults to 'de'). */
  language?: string;
  /** Timeout per feed request in milliseconds (defaults to 10 000). */
  timeoutMs?: number;
  /** Maximum age of articles in hours (defaults to 72). */
  maxAgeHours?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch with an AbortController-based timeout.
 * Returns the Response or throws on timeout / network error.
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; VibeAgentBot/1.0; +https://vibeagent.ch)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Decode common HTML entities found in RSS content.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&laquo;/g, '\u00AB')
    .replace(/&raquo;/g, '\u00BB')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&#8230;/g, '\u2026');
}

/**
 * Strip HTML/XML tags from a string, leaving only text content.
 */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Extract text content of a named XML element.
 * Returns empty string when the element is not found.
 *
 * Handles both `<tag>text</tag>` and `<tag><![CDATA[text]]></tag>`.
 */
function extractTagContent(xml: string, tag: string): string {
  // Try CDATA first
  const cdataRe = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
    'i'
  );
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }

  // Plain text content
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const plainMatch = xml.match(plainRe);
  if (plainMatch) {
    return decodeHtmlEntities(plainMatch[1].trim());
  }

  return '';
}

/**
 * Parse an RSS 2.0 XML document and return an array of items.
 *
 * Handles:
 *  - `<item>` elements with title, link, description, pubDate
 *  - `<dc:creator>` or `<author>` for the creator field
 *  - CDATA-wrapped content
 */
function parseRssFeed(xml: string): RssItem[] {
  const items: RssItem[] = [];

  // Split on <item> boundaries.  The regex captures everything between
  // opening and closing <item> tags (including nested content).
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = stripTags(extractTagContent(block, 'title'));
    let link = extractTagContent(block, 'link');

    // Some feeds put the URL inside a <guid> when <link> is empty
    if (!link) {
      const guid = extractTagContent(block, 'guid');
      if (guid.startsWith('http')) {
        link = guid;
      }
    }

    // Google News feeds sometimes wrap the real URL inside a redirect.
    // Extract the actual destination when present.
    if (link.includes('news.google.com') && link.includes('&url=')) {
      try {
        const parsed = new URL(link);
        const realUrl = parsed.searchParams.get('url');
        if (realUrl) link = realUrl;
      } catch {
        // keep original link
      }
    }

    const description = stripTags(extractTagContent(block, 'description'));
    const pubDate = extractTagContent(block, 'pubDate');

    // dc:creator or author
    let creator = extractTagContent(block, 'dc:creator');
    if (!creator) {
      creator = extractTagContent(block, 'author');
    }
    creator = stripTags(creator);

    if (title || link) {
      items.push({ title, link, description, pubDate, creator });
    }
  }

  return items;
}

/**
 * Generate a deterministic external ID from a URL.
 */
function externalIdFromUrl(url: string): string {
  // Simple hash -- good enough for deduplication purposes.
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const ch = url.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return `rss-${Math.abs(hash).toString(36)}`;
}

// ---------------------------------------------------------------------------
// RssScraper
// ---------------------------------------------------------------------------

export class RssScraper implements BaseScraper {
  name = 'RSS / Swiss News';
  platform = 'news' as const;

  private sources: NewsSource[];
  private cantons: string[];
  private language: string;
  private timeoutMs: number;
  private maxAgeHours: number;

  constructor(options?: RssScraperOptions) {
    this.sources = NEWS_SOURCES;
    this.language = options?.language ?? 'de';
    this.timeoutMs = options?.timeoutMs ?? 8_000;
    this.maxAgeHours = options?.maxAgeHours ?? 72;

    // Default cantons: all keys available in the geo-feeds map
    this.cantons = options?.cantons ?? Object.keys(GOOGLE_NEWS_GEO_FEEDS);
  }

  // ---- BaseScraper interface ------------------------------------------------

  /**
   * RSS feeds are publicly accessible -- no credentials needed.
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Scrape all configured Swiss news feeds for articles matching `keywords`.
   *
   * 1. Fetch direct RSS feeds from sources where `rssFeed` is set.
   * 2. Fetch Google News proxy feeds for sources with `googleNewsProxy`.
   * 3. Fetch Google News geo feeds per canton.
   * 4. Deduplicate by URL.
   * 5. Filter by keywords (case-insensitive match in title or description).
   * 6. Return sorted by date descending.
   */
  async scrape(keywords: string[]): Promise<ScrapedItem[]> {
    const startTime = Date.now();
    console.log(
      `[RssScraper] Starting scrape with ${keywords.length} keywords, ` +
        `${this.sources.length} sources, ${this.cantons.length} cantons, ` +
        `language=${this.language}`
    );

    // Collect all feed URLs to fetch.
    const feedTasks: Array<{ url: string; sourceName: string }> = [];

    // --- 1. Direct RSS feeds -------------------------------------------------
    for (const source of this.sources) {
      if (source.rssFeed) {
        feedTasks.push({ url: source.rssFeed, sourceName: source.name });
      }
    }

    // --- 2. Google News proxy feeds ------------------------------------------
    for (const source of this.sources) {
      if (source.googleNewsProxy) {
        for (const keyword of keywords) {
          const domain = new URL(source.url).hostname.replace('www.', '');
          const url = this.buildGoogleNewsUrl(domain, keyword);
          feedTasks.push({
            url,
            sourceName: `Google News (${source.name} / ${keyword})`,
          });
        }
      }
    }

    // --- 3. Google News geo feeds per canton ----------------------------------
    for (const canton of this.cantons) {
      const feedUrl = getGoogleNewsFeed(canton, keywords);
      if (feedUrl) {
        feedTasks.push({
          url: feedUrl,
          sourceName: `Google News Geo (${canton})`,
        });
      }
    }

    console.log(
      `[RssScraper] Fetching ${feedTasks.length} feed(s) in parallel`
    );

    // --- Fetch all feeds concurrently ----------------------------------------
    const results = await Promise.allSettled(
      feedTasks.map((task) => this.fetchAndParseFeed(task.url, task.sourceName))
    );

    // Flatten all successfully parsed items.
    const allItems: ScrapedItem[] = [];
    let failCount = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      } else {
        failCount++;
        console.warn(
          `[RssScraper] Feed failed (${feedTasks[i].sourceName}): ${result.reason}`
        );
      }
    }

    if (failCount > 0) {
      console.warn(
        `[RssScraper] ${failCount}/${feedTasks.length} feeds failed`
      );
    }

    // --- 4. Deduplicate by URL -----------------------------------------------
    const deduped = this.deduplicateByUrl(allItems);

    // --- 5. Filter by keywords -----------------------------------------------
    const filtered =
      keywords.length > 0
        ? this.filterByKeywords(deduped, keywords)
        : deduped;

    // --- 6. Filter by age ----------------------------------------------------
    const cutoff = new Date(
      Date.now() - this.maxAgeHours * 60 * 60 * 1000
    );
    const recent = filtered.filter((item) => item.publishedAt >= cutoff);

    // --- 7. Sort by date descending ------------------------------------------
    recent.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );

    const elapsed = Date.now() - startTime;
    console.log(
      `[RssScraper] Done in ${elapsed}ms -- ` +
        `${allItems.length} raw, ${deduped.length} deduped, ` +
        `${filtered.length} after keyword filter, ${recent.length} within age limit`
    );

    return recent;
  }

  // ---- Private helpers ------------------------------------------------------

  /**
   * Build a Google News RSS search URL scoped to a specific domain + keyword.
   */
  private buildGoogleNewsUrl(domain: string, keyword: string): string {
    const query = encodeURIComponent(`site:${domain} ${keyword}`);
    const lang = encodeURIComponent(this.language);
    return (
      `https://news.google.com/rss/search?q=${query}` +
      `&hl=${lang}&gl=CH&ceid=CH:${lang}`
    );
  }

  /**
   * Fetch a single RSS feed URL, parse it, and convert items to ScrapedItem[].
   */
  private async fetchAndParseFeed(
    url: string,
    sourceName: string
  ): Promise<ScrapedItem[]> {
    const response = await fetchWithTimeout(url, this.timeoutMs);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ${response.statusText} for ${url}`
      );
    }

    const xml = await response.text();

    if (!xml || xml.length === 0) {
      console.warn(`[RssScraper] Empty response from ${sourceName}`);
      return [];
    }

    const rssItems = parseRssFeed(xml);

    console.log(
      `[RssScraper] Parsed ${rssItems.length} items from ${sourceName}`
    );

    return rssItems
      .filter((item) => item.link) // skip items without a URL
      .map((item) => this.toScrapedItem(item, sourceName));
  }

  /**
   * Convert a raw RssItem into the normalised ScrapedItem format.
   */
  private toScrapedItem(item: RssItem, sourceName: string): ScrapedItem {
    let publishedAt: Date;
    try {
      publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
      // Guard against invalid dates
      if (isNaN(publishedAt.getTime())) {
        publishedAt = new Date();
      }
    } catch {
      publishedAt = new Date();
    }

    // Cleanup: strip remaining HTML tags, collapse whitespace, trim
    const cleanTitle = (item.title || '(untitled)')
      .replace(/<[^>]*>/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    const cleanContent = (item.description || '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return {
      externalId: externalIdFromUrl(item.link),
      title: cleanTitle,
      url: item.link,
      content: cleanContent,
      author: item.creator || sourceName,
      authorUrl: '',
      platform: 'news',
      publishedAt,
      engagementCount: 0,
    };
  }

  /**
   * Remove duplicate items based on normalised URL.
   * Keeps the first occurrence (which tends to be from the more specific feed).
   */
  private deduplicateByUrl(items: ScrapedItem[]): ScrapedItem[] {
    const seen = new Set<string>();
    const unique: ScrapedItem[] = [];

    for (const item of items) {
      // Normalise: strip trailing slash, lowercase, remove query params for dedup
      let key: string;
      try {
        const u = new URL(item.url);
        key = `${u.hostname}${u.pathname}`.toLowerCase().replace(/\/+$/, '');
      } catch {
        key = item.url.toLowerCase();
      }

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    return unique;
  }

  /** Blocklist of irrelevant terms (sports, entertainment, etc.). */
  private static BLOCKLIST = [
    'fussball',
    'champions league',
    'bundesliga',
    'tennis',
    'ski-wm',
    'eurovision',
    'hollywood',
  ];

  /**
   * Keep only items that are relevant based on keyword matching.
   *
   * An article passes if:
   *  - It matches at least 1 keyword in the title, OR
   *  - It matches at least 2 keywords in the combined title + content.
   *
   * Articles matching any blocklist term are always excluded.
   */
  private filterByKeywords(
    items: ScrapedItem[],
    keywords: string[]
  ): ScrapedItem[] {
    const lowerKeywords = keywords.map((k) => k.toLowerCase());

    return items.filter((item) => {
      const lowerTitle = item.title.toLowerCase();
      const lowerContent = item.content.toLowerCase();
      const haystack = `${lowerTitle} ${lowerContent}`;

      // Blocklist check: skip clearly irrelevant articles
      if (
        RssScraper.BLOCKLIST.some((term) => haystack.includes(term))
      ) {
        return false;
      }

      // Count keyword matches in title only
      const titleMatches = lowerKeywords.filter((kw) =>
        lowerTitle.includes(kw)
      ).length;

      // If at least 1 keyword is in the title, accept
      if (titleMatches >= 1) {
        return true;
      }

      // Otherwise require at least 2 keyword matches across title + content
      const totalMatches = lowerKeywords.filter((kw) =>
        haystack.includes(kw)
      ).length;

      return totalMatches >= 2;
    });
  }
}
