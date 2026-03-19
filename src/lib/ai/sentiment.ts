import { openai } from './client';
import { SENTIMENT_SYSTEM_PROMPT } from './prompts';

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  tags: string[];
  needsResponse: boolean;
  isViral: boolean;
}

const BATCH_SIZE = 20;

function neutralDefault(): SentimentResult {
  return {
    sentiment: 'neutral',
    sentimentScore: 0,
    tags: ['Allgemein'],
    needsResponse: false,
    isViral: false,
  };
}

/**
 * Analyse the sentiment of a batch of mention texts using GPT-4o.
 *
 * Sends up to 20 mentions per API call and returns a SentimentResult for each.
 * Falls back to neutral defaults if the API call fails.
 */
export async function analyzeSentiment(
  mentions: string[]
): Promise<SentimentResult[]> {
  if (mentions.length === 0) return [];

  const allResults: SentimentResult[] = [];

  for (let i = 0; i < mentions.length; i += BATCH_SIZE) {
    const batch = mentions.slice(i, i + BATCH_SIZE);

    const userMessage = batch
      .map((text, idx) => `${idx + 1}. "${text}"`)
      .join('\n');

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SENTIMENT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Analysiere die folgenden Erwähnungen und gib für jede eine JSON-Analyse zurück:\n\n${userMessage}\n\nAntworte als JSON-Objekt mit dem Schlüssel "results" als Array.`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        allResults.push(...batch.map(() => neutralDefault()));
        continue;
      }

      const parsed = JSON.parse(content) as { results: SentimentResult[] };

      if (!Array.isArray(parsed.results)) {
        allResults.push(...batch.map(() => neutralDefault()));
        continue;
      }

      // Validate and normalise each result
      for (let j = 0; j < batch.length; j++) {
        const raw = parsed.results[j];
        if (!raw) {
          allResults.push(neutralDefault());
          continue;
        }

        allResults.push({
          sentiment: ['positive', 'negative', 'neutral'].includes(raw.sentiment)
            ? raw.sentiment
            : 'neutral',
          sentimentScore: Math.max(-1, Math.min(1, Number(raw.sentimentScore) || 0)),
          tags: Array.isArray(raw.tags) ? raw.tags.map(String) : ['Allgemein'],
          needsResponse: Boolean(raw.needsResponse),
          isViral: Boolean(raw.isViral),
        });
      }
    } catch (error) {
      console.error('Sentiment analysis API error:', error);
      allResults.push(...batch.map(() => neutralDefault()));
    }
  }

  return allResults;
}
