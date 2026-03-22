import { NextResponse } from 'next/server';
import { runAllScrapers } from '@/lib/scraper/scheduler';
import { insertMention, getMentionCount, getSettings } from '@/lib/db/helpers';
import { getUserFromRequest } from '@/lib/auth';

/** Overall request timeout (120 seconds — more scrapers need more time). */
const SCRAPE_TIMEOUT_MS = 120_000;

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }
  const count = await getMentionCount(user.userId);
  return NextResponse.json({
    status: 'ready',
    sources: 'Swiss news (65+ sources) + Twitter/X + Reddit + YouTube + Facebook + Instagram + TikTok',
    method: 'POST to trigger scraping',
    mentionsInDb: count,
  });
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const settings = await getSettings(user.userId);
    const keywords = settings.keywords.length > 0 ? settings.keywords : ['Zürich', 'Gemeinderat'];

    // Run only user-enabled scrapers via the scheduler
    const scrapeResult = await Promise.race([
      runAllScrapers(keywords, {
        language: settings.language,
        cantons: settings.cantons,
        enabledPlatforms: settings.enabledPlatforms,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Scrape timed out after 120 seconds')),
          SCRAPE_TIMEOUT_MS,
        ),
      ),
    ]);

    const elapsed = Date.now() - startTime;

    // Save each scraped item to the database
    let newCount = 0;
    let firstError = '';
    for (const item of scrapeResult.items) {
      // Convert publishedAt to ISO string
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
          id: `${item.platform}-${item.externalId}`,
          sourceId: `src-${item.platform}`,
          platform: item.platform,
          title: item.title,
          url: item.url,
          content: item.content,
          author: item.author,
          authorUrl: item.authorUrl,
          engagementCount: item.engagementCount,
          createdAt,
        }, user.userId);
        if (Number(result.rowsAffected) > 0) {
          newCount++;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[Scrape] Insert error for', item.externalId, ':', msg);
        if (!firstError) firstError = msg;
      }
    }

    // Sample titles for response
    const sampleTitles = scrapeResult.items.slice(0, 5).map((item) => item.title);

    return NextResponse.json({
      success: true,
      totalScraped: scrapeResult.items.length,
      newItems: newCount,
      duplicatesSkipped: scrapeResult.items.length - newCount,
      breakdown: scrapeResult.breakdown,
      scraperErrors: scrapeResult.errors,
      sampleTitles,
      durationMs: elapsed,
      ...(firstError ? { debugError: firstError } : {}),
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
