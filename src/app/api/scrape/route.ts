import { NextResponse } from 'next/server';
import { RssScraper } from '@/lib/scraper/rss';
import { insertMention, getMentionCount } from '@/lib/db/helpers';

const DEFAULT_KEYWORDS = [
  'Müller',
  'Gemeinderat',
  'Zürich',
  'Verkehr',
  'Wohnen',
  'Klimaschutz',
];

/** Overall request timeout (90 seconds). */
const SCRAPE_TIMEOUT_MS = 90_000;

export async function GET() {
  const count = await getMentionCount();
  return NextResponse.json({
    status: 'ready',
    sources: 'Swiss news sources (65+ newspapers, 26 canton geo-feeds)',
    method: 'POST to trigger scraping',
    mentionsInDb: count,
  });
}

export async function POST() {
  const startTime = Date.now();

  try {
    const scraper = new RssScraper({
      language: 'de',
    });

    // Race the scrape against a hard timeout
    const items = await Promise.race([
      scraper.scrape(DEFAULT_KEYWORDS),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Scrape timed out after 90 seconds')),
          SCRAPE_TIMEOUT_MS,
        ),
      ),
    ]);

    const elapsed = Date.now() - startTime;

    // Save each scraped item to the database
    let newCount = 0;
    for (const item of items) {
      // Convert publishedAt to ISO string, handling both Date objects and strings
      let createdAt: string;
      if (item.publishedAt instanceof Date) {
        createdAt = item.publishedAt.toISOString();
      } else if (typeof item.publishedAt === 'string') {
        createdAt = new Date(item.publishedAt).toISOString();
      } else {
        createdAt = new Date().toISOString();
      }

      try {
        const result = await insertMention({
          id: `rss-${item.externalId}`,
          sourceId: `src-${item.platform}`,
          platform: item.platform,
          title: item.title,
          url: item.url,
          content: item.content,
          author: item.author,
          authorUrl: item.authorUrl,
          engagementCount: item.engagementCount,
          createdAt,
        });
        if (result.rowsAffected > 0) {
          newCount++;
        }
      } catch {
        // Duplicate or insert error — skip silently
      }
    }

    // Return count and a few sample titles instead of the full items array
    const sampleTitles = items.slice(0, 5).map((item) => item.title);

    return NextResponse.json({
      success: true,
      totalScraped: items.length,
      newItems: newCount,
      duplicatesSkipped: items.length - newCount,
      sampleTitles,
      durationMs: elapsed,
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error('[/api/scrape] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        durationMs: elapsed,
      },
      { status: 500 },
    );
  }
}
