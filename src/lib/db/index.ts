import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'vibeagent.db');

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS mentions (
    id TEXT PRIMARY KEY,
    politician_id TEXT NOT NULL DEFAULT 'default',
    source_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    author_url TEXT NOT NULL DEFAULT '',
    sentiment TEXT NOT NULL DEFAULT 'neutral',
    sentiment_score REAL NOT NULL DEFAULT 0,
    is_viral INTEGER NOT NULL DEFAULT 0,
    engagement_count INTEGER NOT NULL DEFAULT 0,
    needs_response INTEGER NOT NULL DEFAULT 0,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    mention_id TEXT NOT NULL REFERENCES mentions(id),
    generated_text TEXT NOT NULL,
    improved_text TEXT,
    was_copied INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    politician_id TEXT NOT NULL DEFAULT 'default',
    name TEXT NOT NULL,
    importance TEXT NOT NULL DEFAULT 'mittel',
    mention_count INTEGER NOT NULL DEFAULT 0,
    trend TEXT NOT NULL DEFAULT 'stable',
    date TEXT NOT NULL
  );
`);

console.log('[DB] SQLite database initialized at', DB_PATH);
