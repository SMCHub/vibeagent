import { NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/ai/sentiment';
import { extractTopics } from '@/lib/ai/topics';

export const maxDuration = 60;

import {
  getAllMentions,
  updateMentionSentiment,
  replaceTopics,
} from '@/lib/db/helpers';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const allMentions = await getAllMentions(user.userId);

    if (allMentions.length === 0) {
      return NextResponse.json({
        success: true,
        analyzed: 0,
        message: 'Keine Erwähnungen in der Datenbank. Bitte zuerst scrapen.',
      });
    }

    // Filter to only unanalyzed mentions (sentiment === 'neutral' and sentimentScore === 0)
    const unanalyzed = allMentions.filter(
      (m) => m.sentiment === 'neutral' && m.sentimentScore === 0,
    );

    if (unanalyzed.length === 0) {
      return NextResponse.json({
        success: true,
        analyzed: 0,
        message: 'Alle Erwähnungen wurden bereits analysiert.',
        totalMentions: allMentions.length,
      });
    }

    // Run GPT-4o sentiment analysis on the unanalyzed mentions
    const mentionTexts = unanalyzed.map((m) => m.content);
    const results = await analyzeSentiment(mentionTexts);

    // Update each mention in the DB with its sentiment result
    let updatedCount = 0;
    for (let i = 0; i < unanalyzed.length; i++) {
      const mention = unanalyzed[i];
      const result = results[i];
      if (result) {
        await updateMentionSentiment(mention.id, {
          sentiment: result.sentiment,
          sentimentScore: result.sentimentScore,
          tags: result.tags,
          needsResponse: result.needsResponse,
          isViral: result.isViral,
        });
        updatedCount++;
      }
    }

    // Run topic extraction on ALL mentions (including previously analyzed ones)
    // so the topic radar reflects the full picture
    const refreshedMentions = await getAllMentions(user.userId);
    const extractedTopics = await extractTopics(refreshedMentions);
    await replaceTopics(
      extractedTopics.map((t) => ({
        id: t.id,
        name: t.name,
        importance: t.importance,
        mentionCount: t.mentionCount,
        trend: t.trend,
      })),
      user.userId,
    );

    return NextResponse.json({
      success: true,
      analyzed: updatedCount,
      totalMentions: allMentions.length,
      topicsExtracted: extractedTopics.length,
    });
  } catch (error) {
    console.error('[/api/analyze] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
