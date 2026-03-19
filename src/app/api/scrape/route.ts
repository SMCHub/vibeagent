import { NextResponse } from 'next/server';
import { RssScraper } from '@/lib/scraper/rss';

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
  return NextResponse.json({
    status: 'ready',
    sources: 'Swiss news sources (65+ newspapers, 26 canton geo-feeds)',
    method: 'POST to trigger scraping',
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

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
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
