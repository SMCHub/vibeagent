import { db } from './index';
import { mentions, responses, topics } from './schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { Mention, Response, Topic, DashboardData, SentimentType, Importance, Trend, Platform } from '@/lib/types';

function rowToMention(row: typeof mentions.$inferSelect): Mention {
  return {
    id: row.id,
    politicianId: row.politicianId,
    articleId: row.sourceId,
    sourceId: row.sourceId,
    platform: row.platform as Platform,
    content: row.content,
    author: row.author,
    authorUrl: row.authorUrl,
    sentiment: row.sentiment as SentimentType,
    sentimentScore: row.sentimentScore,
    isViral: Boolean(row.isViral),
    engagementCount: row.engagementCount,
    needsResponse: Boolean(row.needsResponse),
    tags: JSON.parse(row.tags),
    createdAt: new Date(row.createdAt),
  };
}

function rowToResponse(row: typeof responses.$inferSelect): Response {
  return {
    id: row.id,
    mentionId: row.mentionId,
    generatedText: row.generatedText,
    improvedText: row.improvedText,
    wasCopied: Boolean(row.wasCopied),
  };
}

function rowToTopic(row: typeof topics.$inferSelect): Topic {
  return {
    id: row.id,
    politicianId: row.politicianId,
    name: row.name,
    importance: row.importance as Importance,
    mentionCount: row.mentionCount,
    trend: row.trend as Trend,
    date: new Date(row.date),
  };
}

export async function getAllMentions(): Promise<Mention[]> {
  const rows = await db.select().from(mentions).orderBy(desc(mentions.createdAt));
  return rows.map(rowToMention);
}

export async function getMentionById(id: string): Promise<Mention | null> {
  const rows = await db.select().from(mentions).where(eq(mentions.id, id));
  return rows[0] ? rowToMention(rows[0]) : null;
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
  return db.insert(mentions).values({
    ...mention,
    politicianId: 'default',
    sentiment: 'neutral',
    sentimentScore: 0,
    isViral: 0,
    needsResponse: 0,
    tags: '[]',
  }).onConflictDoNothing();
}

export async function updateMentionSentiment(id: string, data: {
  sentiment: string;
  sentimentScore: number;
  tags: string[];
  needsResponse: boolean;
  isViral: boolean;
}) {
  return db.update(mentions).set({
    sentiment: data.sentiment,
    sentimentScore: data.sentimentScore,
    tags: JSON.stringify(data.tags),
    needsResponse: data.needsResponse ? 1 : 0,
    isViral: data.isViral ? 1 : 0,
  }).where(eq(mentions.id, id));
}

export async function getAllResponses(): Promise<Record<string, Response>> {
  const rows = await db.select().from(responses);
  const map: Record<string, Response> = {};
  for (const row of rows) {
    map[row.mentionId] = rowToResponse(row);
  }
  return map;
}

export async function getResponseByMentionId(mentionId: string): Promise<Response | null> {
  const rows = await db.select().from(responses).where(eq(responses.mentionId, mentionId));
  return rows[0] ? rowToResponse(rows[0]) : null;
}

export async function insertResponse(data: {
  id: string;
  mentionId: string;
  generatedText: string;
}) {
  return db.insert(responses).values({
    ...data,
    improvedText: null,
    wasCopied: 0,
    createdAt: new Date().toISOString(),
  }).onConflictDoNothing();
}

export async function updateResponseImproved(mentionId: string, improvedText: string) {
  return db.update(responses).set({ improvedText }).where(eq(responses.mentionId, mentionId));
}

export async function getAllTopics(): Promise<Topic[]> {
  const rows = await db.select().from(topics).orderBy(desc(topics.mentionCount));
  return rows.map(rowToTopic);
}

export async function replaceTopics(newTopics: { id: string; name: string; importance: string; mentionCount: number; trend: string; }[]) {
  await db.delete(topics);
  for (const t of newTopics) {
    await db.insert(topics).values({
      ...t,
      politicianId: 'default',
      date: new Date().toISOString(),
    });
  }
}

export async function getDashboardStats() {
  const all = await db.select().from(mentions);
  const total = all.length;
  if (total === 0) return { totalMentions: 0, positivePct: 0, negativePct: 0, neutralPct: 0, needsResponse: 0 };

  const positive = all.filter(m => m.sentiment === 'positive').length;
  const negative = all.filter(m => m.sentiment === 'negative').length;
  const neutral = all.filter(m => m.sentiment === 'neutral').length;
  const needsResponse = all.filter(m => m.needsResponse).length;

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
  const result = await db.select({ count: sql<number>`count(*)` }).from(mentions);
  return result[0]?.count ?? 0;
}
