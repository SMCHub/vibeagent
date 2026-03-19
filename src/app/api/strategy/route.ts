import { NextResponse } from 'next/server'
import { openai } from '@/lib/ai/client'
import { STRATEGY_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { mockDashboardData } from '@/data/mock'

export async function POST() {
  try {
    const { mentions, topics, stats } = mockDashboardData

    const topicSummary = topics
      .map((t) => `- ${t.name} (Wichtigkeit: ${t.importance}, Trend: ${t.trend}, Erwähnungen: ${t.mentionCount})`)
      .join('\n')

    const mentionSummary = mentions
      .map((m) => `- [${m.platform}] ${m.sentiment} (Score: ${m.sentimentScore}): "${m.content.slice(0, 150)}..."`)
      .join('\n')

    const statsOverview = `Gesamt: ${stats.totalMentions} Erwähnungen | Positiv: ${stats.positivePct}% | Negativ: ${stats.negativePct}% | Neutral: ${stats.neutralPct}% | Antwort nötig: ${stats.needsResponse}`

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
    })

    const strategy = response.choices[0]?.message?.content

    if (!strategy) {
      return NextResponse.json(
        { success: false, error: 'Keine Strategie vom KI-Modell generiert' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      strategy,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    )
  }
}
