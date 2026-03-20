import { NextResponse } from 'next/server';
import { openai } from '@/lib/ai/client';
import { STRATEGY_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { getAllMentions, getAllTopics, getDashboardStats } from '@/lib/db/helpers';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const mentions = await getAllMentions(user.userId);
    const topics = await getAllTopics(user.userId);
    const stats = await getDashboardStats(user.userId);

    // If the DB is empty, ask the user to scrape first
    if (mentions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Keine Daten in der Datenbank. Bitte zuerst Erwähnungen scrapen (/api/scrape) und analysieren (/api/analyze).',
        },
        { status: 400 },
      );
    }

    const topicSummary =
      topics.length > 0
        ? topics
            .map(
              (t) =>
                `- ${t.name} (Wichtigkeit: ${t.importance}, Trend: ${t.trend}, Erwähnungen: ${t.mentionCount})`,
            )
            .join('\n')
        : '(Keine Themen extrahiert -- bitte zuerst /api/analyze ausführen)';

    const mentionSummary = mentions
      .map(
        (m) =>
          `- [${m.platform}] ${m.sentiment} (Score: ${m.sentimentScore}): "${m.content.slice(0, 150)}..."`,
      )
      .join('\n');

    const statsOverview = `Gesamt: ${stats.totalMentions} Erwähnungen | Positiv: ${stats.positivePct}% | Negativ: ${stats.negativePct}% | Neutral: ${stats.neutralPct}% | Antwort nötig: ${stats.needsResponse}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: STRATEGY_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Erstelle ein Strategie-Briefing basierend auf den folgenden Daten:\n\n## Statistik-Überblick\n${statsOverview}\n\n## Aktuelle Themen\n${topicSummary}\n\n## Aktuelle Erwähnungen\n${mentionSummary}`,
        },
      ],
      temperature: 0.7,
    });

    const strategy = response.choices[0]?.message?.content;

    if (!strategy) {
      return NextResponse.json(
        { success: false, error: 'Keine Strategie vom KI-Modell generiert' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      strategy,
    });
  } catch (error) {
    console.error('[/api/strategy] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
