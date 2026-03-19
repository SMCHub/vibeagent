import { NextResponse } from 'next/server';
import { NEWS_SOURCES, SOCIAL_MEDIA_TARGETS, CANTONS, GOOGLE_NEWS_GEO_FEEDS } from '@/lib/sources/switzerland';
import { getMentionCount } from '@/lib/db/helpers';

export async function GET() {
  const mentionCount = await getMentionCount();

  return NextResponse.json({
    cantons: CANTONS,
    newsSources: NEWS_SOURCES.length,
    socialMediaTargets: SOCIAL_MEDIA_TARGETS.length,
    googleNewsGeoFeeds: Object.keys(GOOGLE_NEWS_GEO_FEEDS).length,
    mentionsInDb: mentionCount,
    sources: {
      news: NEWS_SOURCES.map(s => ({ id: s.id, name: s.name, region: s.region, language: s.language, hasRss: !!s.rssFeed, hasGoogleProxy: s.googleNewsProxy })),
      social: SOCIAL_MEDIA_TARGETS.map(s => ({ id: s.id, platform: s.platform, name: s.name, region: s.region })),
    }
  });
}
