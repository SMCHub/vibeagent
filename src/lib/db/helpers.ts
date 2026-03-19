import { rawClient } from './index';
import type { Mention, Response, Topic, DashboardData, SentimentType, Importance, Trend, Platform } from '@/lib/types';

type Row = Record<string, unknown>;

function rowToMention(row: Row): Mention {
  return {
    id: String(row.id),
    politicianId: String(row.politician_id),
    articleId: String(row.source_id),
    sourceId: String(row.source_id),
    platform: String(row.platform) as Platform,
    content: String(row.content),
    author: String(row.author),
    authorUrl: String(row.author_url ?? ''),
    sentiment: String(row.sentiment) as SentimentType,
    sentimentScore: Number(row.sentiment_score),
    isViral: Boolean(row.is_viral),
    engagementCount: Number(row.engagement_count),
    needsResponse: Boolean(row.needs_response),
    tags: JSON.parse(String(row.tags || '[]')),
    createdAt: new Date(String(row.created_at)),
  };
}

function rowToResponse(row: Row): Response {
  return {
    id: String(row.id),
    mentionId: String(row.mention_id),
    generatedText: String(row.generated_text),
    improvedText: row.improved_text ? String(row.improved_text) : null,
    wasCopied: Boolean(row.was_copied),
  };
}

function rowToTopic(row: Row): Topic {
  return {
    id: String(row.id),
    politicianId: String(row.politician_id),
    name: String(row.name),
    importance: String(row.importance) as Importance,
    mentionCount: Number(row.mention_count),
    trend: String(row.trend) as Trend,
    date: new Date(String(row.date)),
  };
}

export async function getAllMentions(): Promise<Mention[]> {
  const result = await rawClient.execute('SELECT * FROM mentions ORDER BY created_at DESC');
  return result.rows.map(rowToMention);
}

export async function getMentionById(id: string): Promise<Mention | null> {
  const result = await rawClient.execute({ sql: 'SELECT * FROM mentions WHERE id = ?', args: [id] });
  return result.rows[0] ? rowToMention(result.rows[0]) : null;
}

export async function insertMention(mention: {
  id: string;
  sourceId: string;
  platform: string;
  title: string;
  url: string;
  content: string;
  author: string;
  authorUrl: string;
  engagementCount: number;
  createdAt: string;
}) {
  return rawClient.execute({
    sql: 'INSERT OR IGNORE INTO mentions (id, politician_id, source_id, platform, title, url, content, author, author_url, sentiment, sentiment_score, is_viral, engagement_count, needs_response, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      mention.id, 'default', mention.sourceId, mention.platform,
      mention.title, mention.url, mention.content, mention.author,
      mention.authorUrl, 'neutral', 0, 0, mention.engagementCount,
      0, '[]', mention.createdAt
    ],
  });
}

export async function updateMentionSentiment(id: string, data: {
  sentiment: string;
  sentimentScore: number;
  tags: string[];
  needsResponse: boolean;
  isViral: boolean;
}) {
  return rawClient.execute({
    sql: 'UPDATE mentions SET sentiment = ?, sentiment_score = ?, tags = ?, needs_response = ?, is_viral = ? WHERE id = ?',
    args: [data.sentiment, data.sentimentScore, JSON.stringify(data.tags), data.needsResponse ? 1 : 0, data.isViral ? 1 : 0, id],
  });
}

export async function getAllResponses(): Promise<Record<string, Response>> {
  const result = await rawClient.execute('SELECT * FROM responses');
  const map: Record<string, Response> = {};
  for (const row of result.rows) {
    const r = rowToResponse(row);
    map[r.mentionId] = r;
  }
  return map;
}

export async function getResponseByMentionId(mentionId: string): Promise<Response | null> {
  const result = await rawClient.execute({ sql: 'SELECT * FROM responses WHERE mention_id = ?', args: [mentionId] });
  return result.rows[0] ? rowToResponse(result.rows[0]) : null;
}

export async function insertResponse(data: {
  id: string;
  mentionId: string;
  generatedText: string;
}) {
  return rawClient.execute({
    sql: 'INSERT OR IGNORE INTO responses (id, mention_id, generated_text, improved_text, was_copied, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [data.id, data.mentionId, data.generatedText, null, 0, new Date().toISOString()],
  });
}

export async function updateResponseImproved(mentionId: string, improvedText: string) {
  return rawClient.execute({
    sql: 'UPDATE responses SET improved_text = ? WHERE mention_id = ?',
    args: [improvedText, mentionId],
  });
}

export async function getAllTopics(): Promise<Topic[]> {
  const result = await rawClient.execute('SELECT * FROM topics ORDER BY mention_count DESC');
  return result.rows.map(rowToTopic);
}

export async function replaceTopics(newTopics: { id: string; name: string; importance: string; mentionCount: number; trend: string; }[]) {
  await rawClient.execute('DELETE FROM topics');
  for (const t of newTopics) {
    await rawClient.execute({
      sql: 'INSERT INTO topics (id, politician_id, name, importance, mention_count, trend, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [t.id, 'default', t.name, t.importance, t.mentionCount, t.trend, new Date().toISOString()],
    });
  }
}

export async function getDashboardStats() {
  const result = await rawClient.execute('SELECT sentiment, needs_response FROM mentions');
  const all = result.rows;
  const total = all.length;
  if (total === 0) return { totalMentions: 0, positivePct: 0, negativePct: 0, neutralPct: 0, needsResponse: 0 };

  const positive = all.filter(m => m.sentiment === 'positive').length;
  const negative = all.filter(m => m.sentiment === 'negative').length;
  const neutral = all.filter(m => m.sentiment === 'neutral').length;
  const needsResponse = all.filter(m => m.needs_response).length;

  return {
    totalMentions: total,
    positivePct: Math.round((positive / total) * 100),
    negativePct: Math.round((negative / total) * 100),
    neutralPct: Math.round((neutral / total) * 100),
    needsResponse,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  return {
    politician: {
      id: 'default',
      name: 'Thomas Müller',
      title: 'Gemeinderat',
      keywords: ['Müller', 'Gemeinderat', 'Zürich', 'Mitte', 'Verkehr', 'Wohnen'],
      constituency: 'Stadt Zürich',
      sources: [],
    },
    mentions: await getAllMentions(),
    responses: await getAllResponses(),
    topics: await getAllTopics(),
    stats: await getDashboardStats(),
  };
}

export async function getMentionCount(): Promise<number> {
  const result = await rawClient.execute('SELECT count(*) as cnt FROM mentions');
  return Number(result.rows[0]?.cnt ?? 0);
}
