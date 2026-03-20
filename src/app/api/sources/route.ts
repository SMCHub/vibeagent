import { NextResponse } from 'next/server';
import { NEWS_SOURCES, SOCIAL_MEDIA_TARGETS, CANTONS, GOOGLE_NEWS_GEO_FEEDS } from '@/lib/sources/switzerland';
import { getMentionCount } from '@/lib/db/helpers';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }

  const mentionCount = await getMentionCount(user.userId);

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
