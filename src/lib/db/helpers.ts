import { db } from './index';
import { mentions, responses, topics } from './schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { Mention, Response, Topic, DashboardData, SentimentType, Importance, Trend, Platform } from '@/lib/types';

// Convert DB row to Mention type
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
    isViral: row.isViral,
    engagementCount: row.engagementCount,
    needsResponse: row.needsResponse,
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
    wasCopied: row.wasCopied,
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

export function getAllMentions(): Mention[] {
  const rows = db.select().from(mentions).orderBy(desc(mentions.createdAt)).all();
  return rows.map(rowToMention);
}

export function getMentionById(id: string): Mention | null {
  const row = db.select().from(mentions).where(eq(mentions.id, id)).get();
  return row ? rowToMention(row) : null;
}

export function insertMention(mention: {
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
    isViral: false,
    needsResponse: false,
    tags: '[]',
  }).onConflictDoNothing().run();
}

export function updateMentionSentiment(id: string, data: {
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
    needsResponse: data.needsResponse,
    isViral: data.isViral,
  }).where(eq(mentions.id, id)).run();
}

export function getAllResponses(): Record<string, Response> {
  const rows = db.select().from(responses).all();
  const map: Record<string, Response> = {};
  for (const row of rows) {
    map[row.mentionId] = rowToResponse(row);
  }
  return map;
}

export function getResponseByMentionId(mentionId: string): Response | null {
  const row = db.select().from(responses).where(eq(responses.mentionId, mentionId)).get();
  return row ? rowToResponse(row) : null;
}

export function insertResponse(data: {
  id: string;
  mentionId: string;
  generatedText: string;
}) {
  return db.insert(responses).values({
    ...data,
    improvedText: null,
    wasCopied: false,
    createdAt: new Date().toISOString(),
  }).onConflictDoNothing().run();
}

export function updateResponseImproved(mentionId: string, improvedText: string) {
  return db.update(responses).set({ improvedText }).where(eq(responses.mentionId, mentionId)).run();
}

export function getAllTopics(): Topic[] {
  const rows = db.select().from(topics).orderBy(desc(topics.mentionCount)).all();
  return rows.map(rowToTopic);
}

export function replaceTopics(newTopics: { id: string; name: string; importance: string; mentionCount: number; trend: string; }[]) {
  db.delete(topics).run();
  for (const t of newTopics) {
    db.insert(topics).values({
      ...t,
      politicianId: 'default',
      date: new Date().toISOString(),
    }).run();
  }
}

export function getDashboardStats() {
  const all = db.select().from(mentions).all();
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

export function getDashboardData(): DashboardData {
  return {
    politician: {
      id: 'default',
      name: 'Thomas M\u00fcller',
      title: 'Gemeinderat',
      keywords: ['M\u00fcller', 'Gemeinderat', 'Z\u00fcrich', 'Mitte', 'Verkehr', 'Wohnen'],
      constituency: 'Stadt Z\u00fcrich',
      sources: [],
    },
    mentions: getAllMentions(),
    responses: getAllResponses(),
    topics: getAllTopics(),
    stats: getDashboardStats(),
  };
}

export function getMentionCount(): number {
  const result = db.select({ count: sql<number>`count(*)` }).from(mentions).get();
  return result?.count ?? 0;
}
