import { openai } from './client';
import { RESPONSE_SYSTEM_PROMPT, IMPROVE_SYSTEM_PROMPT } from './prompts';
import type { Mention, Platform } from '@/lib/types';

const platformGuidelines: Record<Platform, string> = {
  twitter: 'Maximal 280 Zeichen, direkt und prägnant',
  facebook: 'Ausführlicher, formell-freundlicher Ton, 2-3 Absätze',
  instagram: 'Persönlich, mit relevanten Hashtags',
  youtube: 'Sachlich, ausführlich, mit Quellenverweisen',
  reddit: 'Faktenbasiert, Community-orientiert, sachlich',
  tiktok: 'Kurz, authentisch, nahbar',
  linkedin: 'Professionell, sachlich, mit Fachbegriffen, 1-2 Absätze',
  news: 'Pressemitteilungsstil, professionell und faktenreich',
};

export async function generateResponse(
  mention: Mention,
  platform: Platform,
): Promise<string> {
  try {
    const guidelines = platformGuidelines[platform] ?? '';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: RESPONSE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Plattform: ${platform}\nPlattform-Richtlinien: ${guidelines}\n\nErwähnung von "${mention.author}":\n"${mention.content}"\n\nTags: ${mention.tags.join(', ')}\nSentiment: ${mention.sentiment} (Score: ${mention.sentimentScore})\n\nErstelle eine passende Antwort.`,
        },
      ],
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      return 'Vielen Dank für Ihre Nachricht. Wir werden uns zeitnah mit dem Thema befassen.';
    }

    return text;
  } catch (error) {
    console.error('Response generation API error:', error);
    return 'Vielen Dank für Ihre Nachricht. Als Ihr Stadtrat nehme ich Ihre Anliegen sehr ernst und werde mich zeitnah mit dem Thema befassen. Für ein persönliches Gespräch stehe ich Ihnen jederzeit zur Verfügung.';
  }
}

export async function improveResponse(
  currentResponse: string,
  feedback?: string,
): Promise<string> {
  try {
    const userContent = feedback
      ? `Aktuelle Antwort:\n"${currentResponse}"\n\nFeedback des Teams:\n"${feedback}"\n\nVerbessere die Antwort basierend auf dem Feedback.`
      : `Aktuelle Antwort:\n"${currentResponse}"\n\nVerbessere die Antwort: Mache sie prägnanter, überzeugender und bürgernaher.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: IMPROVE_SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      return currentResponse;
    }

    return text;
  } catch (error) {
    console.error('Response improvement API error:', error);
    return currentResponse;
  }
}
