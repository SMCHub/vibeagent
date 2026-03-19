import { openai } from './client';
import { TOPICS_SYSTEM_PROMPT } from './prompts';
import type { Mention, Topic } from '@/lib/types';

/**
 * Extract and cluster topics from a list of mentions using GPT-4o.
 * Falls back to simple tag-based extraction if the API call fails.
 */
export async function extractTopics(mentions: Mention[]): Promise<Topic[]> {
  if (mentions.length === 0) return [];

  try {
    const mentionTexts = mentions
      .map((m, i) => `${i + 1}. [${m.platform}] "${m.content}"`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: TOPICS_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analysiere die folgenden ${mentions.length} Erwähnungen und extrahiere die wichtigsten Themen:\n\n${mentionTexts}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return fallbackExtraction(mentions);
    }

    const parsed = JSON.parse(content);

    // The model may return { topics: [...] } or a raw array
    const rawTopics: unknown[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.topics)
        ? parsed.topics
        : [];

    if (rawTopics.length === 0) {
      return fallbackExtraction(mentions);
    }

    const now = new Date();
    const politicianId = mentions[0]?.politicianId ?? '';

    return rawTopics.slice(0, 10).map((raw: any, i: number) => ({
      id: `topic-${i}`,
      politicianId,
      name: String(raw.name || 'Unbekannt'),
      importance: ['hoch', 'mittel', 'niedrig'].includes(raw.importance)
        ? (raw.importance as Topic['importance'])
        : 'mittel',
      mentionCount: typeof raw.mentionCount === 'number' ? raw.mentionCount : 1,
      trend: ['rising', 'stable', 'falling'].includes(raw.trend)
        ? (raw.trend as Topic['trend'])
        : 'stable',
      date: now,
    }));
  } catch (error) {
    console.error('Topic extraction API error:', error);
    return fallbackExtraction(mentions);
  }
}

/**
 * Fallback: simple tag-based extraction when the AI call fails.
 */
function fallbackExtraction(mentions: Mention[]): Topic[] {
  const tagCounts = new Map<string, number>();
  for (const mention of mentions) {
    for (const tag of mention.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const now = new Date();
  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count], i) => ({
      id: `topic-${i}`,
      politicianId: mentions[0]?.politicianId ?? '',
      name,
      importance: count >= 3 ? ('hoch' as const) : count >= 2 ? ('mittel' as const) : ('niedrig' as const),
      mentionCount: count,
      trend: 'stable' as const,
      date: now,
    }));
}
