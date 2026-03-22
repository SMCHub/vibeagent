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
    title: String(row.title ?? ''),
    url: String(row.url ?? ''),
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

export async function getAllMentions(userId: string): Promise<Mention[]> {
  const result = await rawClient.execute({
    sql: 'SELECT * FROM mentions WHERE politician_id = ? ORDER BY created_at DESC',
    args: [userId],
  });
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
}, userId: string) {
  return rawClient.execute({
    sql: 'INSERT OR IGNORE INTO mentions (id, politician_id, source_id, platform, title, url, content, author, author_url, sentiment, sentiment_score, is_viral, engagement_count, needs_response, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      mention.id, userId, mention.sourceId, mention.platform,
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

export async function getAllResponses(userId: string): Promise<Record<string, Response>> {
  const result = await rawClient.execute({
    sql: 'SELECT r.* FROM responses r JOIN mentions m ON r.mention_id = m.id WHERE m.politician_id = ?',
    args: [userId],
  });
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

export async function getAllTopics(userId: string): Promise<Topic[]> {
  const result = await rawClient.execute({
    sql: 'SELECT * FROM topics WHERE politician_id = ? ORDER BY mention_count DESC',
    args: [userId],
  });
  return result.rows.map(rowToTopic);
}

export async function replaceTopics(newTopics: { id: string; name: string; importance: string; mentionCount: number; trend: string; }[], userId: string) {
  await rawClient.execute({ sql: 'DELETE FROM topics WHERE politician_id = ?', args: [userId] });
  for (const t of newTopics) {
    await rawClient.execute({
      sql: 'INSERT INTO topics (id, politician_id, name, importance, mention_count, trend, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [t.id, userId, t.name, t.importance, t.mentionCount, t.trend, new Date().toISOString()],
    });
  }
}

export async function getDashboardStats(userId: string) {
  const result = await rawClient.execute({
    sql: 'SELECT sentiment, needs_response, engagement_count FROM mentions WHERE politician_id = ?',
    args: [userId],
  });
  const all = result.rows;
  const total = all.length;
  if (total === 0) return { totalMentions: 0, positivePct: 0, negativePct: 0, neutralPct: 0, needsResponse: 0, totalReach: 0 };

  const positive = all.filter(m => m.sentiment === 'positive').length;
  const negative = all.filter(m => m.sentiment === 'negative').length;
  const neutral = all.filter(m => m.sentiment === 'neutral').length;
  const needsResponse = all.filter(m => m.needs_response).length;
  const totalReach = all.reduce((sum, m) => sum + Number(m.engagement_count || 0), 0);

  return {
    totalMentions: total,
    positivePct: Math.round((positive / total) * 100),
    negativePct: Math.round((negative / total) * 100),
    neutralPct: Math.round((neutral / total) * 100),
    needsResponse,
    totalReach,
  };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const settings = await getSettings(userId);
  return {
    politician: {
      id: userId,
      name: settings.name,
      title: settings.title,
      keywords: settings.keywords,
      constituency: settings.constituency,
      sources: [],
    },
    mentions: await getAllMentions(userId),
    responses: await getAllResponses(userId),
    topics: await getAllTopics(userId),
    stats: await getDashboardStats(userId),
  };
}

export async function getMentionCount(userId: string): Promise<number> {
  const result = await rawClient.execute({
    sql: 'SELECT count(*) as cnt FROM mentions WHERE politician_id = ?',
    args: [userId],
  });
  return Number(result.rows[0]?.cnt ?? 0);
}

// ---------------------------------------------------------------------------
// Settings persistence
// ---------------------------------------------------------------------------

export async function ensureSettingsTable() {
  await rawClient.execute(`CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Thomas Müller',
    title TEXT NOT NULL DEFAULT 'Gemeinderat',
    constituency TEXT NOT NULL DEFAULT 'Stadt Zürich',
    keywords TEXT NOT NULL DEFAULT '[]',
    language TEXT NOT NULL DEFAULT 'de',
    cantons TEXT NOT NULL DEFAULT '["ZH"]',
    enabled_platforms TEXT NOT NULL DEFAULT '["news","twitter","reddit","hackernews"]',
    enabled_sources TEXT NOT NULL DEFAULT '["20min","blick","watson","nzz","tages-anzeiger","srf-news"]'
  )`);
  // Migrate: add columns if they don't exist yet (older DBs)
  try {
    await rawClient.execute(`ALTER TABLE settings ADD COLUMN enabled_platforms TEXT NOT NULL DEFAULT '["news","twitter","reddit","hackernews"]'`);
  } catch { /* column already exists */ }
  try {
    await rawClient.execute(`ALTER TABLE settings ADD COLUMN enabled_sources TEXT NOT NULL DEFAULT '["20min","blick","watson","nzz","tages-anzeiger","srf-news"]'`);
  } catch { /* column already exists */ }
}

export interface UserSettings {
  name: string;
  title: string;
  constituency: string;
  keywords: string[];
  language: string;
  cantons: string[];
  enabledPlatforms: string[];
  enabledSources: string[];
}

const DEFAULT_SETTINGS: UserSettings = {
  name: 'Thomas Müller',
  title: 'Gemeinderat',
  constituency: 'Stadt Zürich',
  keywords: ['Müller', 'Gemeinderat', 'Zürich', 'Verkehr', 'Wohnen', 'Klimaschutz'],
  language: 'de',
  cantons: ['ZH'],
  enabledPlatforms: ['news', 'twitter', 'reddit', 'hackernews'],
  enabledSources: ['20min', 'blick', 'watson', 'nzz', 'tages-anzeiger', 'srf-news'],
};

export async function getSettings(userId: string): Promise<UserSettings> {
  await ensureSettingsTable();
  const result = await rawClient.execute({ sql: "SELECT * FROM settings WHERE id = ?", args: [userId] });
  if (result.rows[0]) {
    const row = result.rows[0];
    return {
      name: String(row.name || DEFAULT_SETTINGS.name),
      title: String(row.title || DEFAULT_SETTINGS.title),
      constituency: String(row.constituency || DEFAULT_SETTINGS.constituency),
      keywords: JSON.parse(String(row.keywords || '[]')),
      language: String(row.language || 'de'),
      cantons: JSON.parse(String(row.cantons || '["ZH"]')),
      enabledPlatforms: JSON.parse(String(row.enabled_platforms || JSON.stringify(DEFAULT_SETTINGS.enabledPlatforms))),
      enabledSources: JSON.parse(String(row.enabled_sources || JSON.stringify(DEFAULT_SETTINGS.enabledSources))),
    };
  }
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: {
  name: string;
  title: string;
  constituency: string;
  keywords: string[];
  language: string;
  cantons: string[];
  enabledPlatforms?: string[];
  enabledSources?: string[];
}, userId: string) {
  await ensureSettingsTable();
  await rawClient.execute({
    sql: `INSERT OR REPLACE INTO settings (id, name, title, constituency, keywords, language, cantons, enabled_platforms, enabled_sources) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId, settings.name, settings.title, settings.constituency,
      JSON.stringify(settings.keywords), settings.language, JSON.stringify(settings.cantons),
      JSON.stringify(settings.enabledPlatforms ?? DEFAULT_SETTINGS.enabledPlatforms),
      JSON.stringify(settings.enabledSources ?? DEFAULT_SETTINGS.enabledSources),
    ],
  });
}
