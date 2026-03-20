import { rawClient } from './db/index';

// Password hashing with PBKDF2 (Web Crypto API - no deps needed)
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const computedHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return computedHex === hashHex;
}

// Session management
export async function createSession(userId: string): Promise<string> {
  await ensureAuthTables();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  await rawClient.execute({
    sql: 'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
    args: [token, userId, expiresAt],
  });
  return token;
}

export async function validateSession(token: string): Promise<{ userId: string; email: string; name: string } | null> {
  await ensureAuthTables();
  const result = await rawClient.execute({
    sql: `SELECT s.user_id, u.email, u.name FROM sessions s
          JOIN users u ON s.user_id = u.id
          WHERE s.token = ? AND s.expires_at > ?`,
    args: [token, new Date().toISOString()],
  });
  if (!result.rows[0]) return null;
  return {
    userId: String(result.rows[0].user_id),
    email: String(result.rows[0].email),
    name: String(result.rows[0].name),
  };
}

export async function deleteSession(token: string): Promise<void> {
  await rawClient.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] });
}

export async function getUserFromRequest(request: Request): Promise<{ userId: string; email: string; name: string } | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/session=([^;]+)/);
  if (!match) return null;
  return validateSession(match[1]);
}

export async function ensureAuthTables() {
  await rawClient.execute(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    canton TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  )`);
  await rawClient.execute(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )`);
}
