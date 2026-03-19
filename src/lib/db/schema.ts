import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const mentions = sqliteTable('mentions', {
  id: text('id').primaryKey(),
  politicianId: text('politician_id').notNull().default('default'),
  sourceId: text('source_id').notNull(),
  platform: text('platform').notNull(),
  title: text('title').notNull().default(''),
  url: text('url').notNull().default(''),
  content: text('content').notNull(),
  author: text('author').notNull(),
  authorUrl: text('author_url').notNull().default(''),
  sentiment: text('sentiment').notNull().default('neutral'),
  sentimentScore: real('sentiment_score').notNull().default(0),
  isViral: integer('is_viral', { mode: 'boolean' }).notNull().default(false),
  engagementCount: integer('engagement_count').notNull().default(0),
  needsResponse: integer('needs_response', { mode: 'boolean' }).notNull().default(false),
  tags: text('tags').notNull().default('[]'),  // JSON stringified
  createdAt: text('created_at').notNull(),
});

export const responses = sqliteTable('responses', {
  id: text('id').primaryKey(),
  mentionId: text('mention_id').notNull().references(() => mentions.id),
  generatedText: text('generated_text').notNull(),
  improvedText: text('improved_text'),
  wasCopied: integer('was_copied', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export const topics = sqliteTable('topics', {
  id: text('id').primaryKey(),
  politicianId: text('politician_id').notNull().default('default'),
  name: text('name').notNull(),
  importance: text('importance').notNull().default('mittel'),
  mentionCount: integer('mention_count').notNull().default(0),
  trend: text('trend').notNull().default('stable'),
  date: text('date').notNull(),
});
