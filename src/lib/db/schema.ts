// ---------------------------------------------------------------------------
// Database Schema — Political Monitoring Dashboard
// ---------------------------------------------------------------------------
// Phase 2: Install drizzle-orm and uncomment the actual schema below.
//   npm install drizzle-orm better-sqlite3 @types/better-sqlite3
//
// The schema defines 5 tables: politicians, articles, mentions, responses, topics.
// Currently exported as TypeScript type definitions for reference.
// ---------------------------------------------------------------------------

// Phase 2: Uncomment and use Drizzle ORM schema:
//
// import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
//
// export const politicians = sqliteTable('politicians', {
//   id: text('id').primaryKey(),
//   name: text('name').notNull(),
//   title: text('title').notNull(),
//   keywords: text('keywords').notNull(),        // JSON string[]
//   constituency: text('constituency').notNull(),
//   sources: text('sources').notNull(),           // JSON string[]
//   createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
// });
//
// export const articles = sqliteTable('articles', {
//   id: text('id').primaryKey(),
//   sourceId: text('source_id').notNull(),
//   externalId: text('external_id').notNull(),
//   title: text('title').notNull(),
//   url: text('url').notNull(),
//   content: text('content').notNull(),
//   platform: text('platform').notNull(),
//   publishedAt: text('published_at').notNull(),
//   createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
// });
//
// export const mentions = sqliteTable('mentions', {
//   id: text('id').primaryKey(),
//   politicianId: text('politician_id').notNull().references(() => politicians.id),
//   articleId: text('article_id').notNull().references(() => articles.id),
//   sourceId: text('source_id').notNull(),
//   platform: text('platform').notNull(),
//   content: text('content').notNull(),
//   author: text('author').notNull(),
//   authorUrl: text('author_url').notNull(),
//   sentiment: text('sentiment').notNull(),
//   sentimentScore: real('sentiment_score').notNull(),
//   isViral: integer('is_viral').notNull().default(0),
//   engagementCount: integer('engagement_count').notNull().default(0),
//   needsResponse: integer('needs_response').notNull().default(0),
//   tags: text('tags').notNull(),                 // JSON string[]
//   createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
// });
//
// export const responses = sqliteTable('responses', {
//   id: text('id').primaryKey(),
//   mentionId: text('mention_id').notNull().references(() => mentions.id),
//   generatedText: text('generated_text').notNull(),
//   improvedText: text('improved_text'),
//   wasCopied: integer('was_copied').notNull().default(0),
//   createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
// });
//
// export const topics = sqliteTable('topics', {
//   id: text('id').primaryKey(),
//   politicianId: text('politician_id').notNull().references(() => politicians.id),
//   name: text('name').notNull(),
//   importance: text('importance').notNull(),
//   mentionCount: integer('mention_count').notNull().default(0),
//   trend: text('trend').notNull(),
//   date: text('date').notNull(),
//   createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
// });

export const SCHEMA_VERSION = '1.0.0';
