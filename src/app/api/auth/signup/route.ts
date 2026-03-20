import { NextResponse } from 'next/server';
import { hashPassword, createSession, ensureAuthTables } from '@/lib/auth';
import { rawClient } from '@/lib/db/index';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await ensureAuthTables();
    const { firstName, lastName, email, password, canton, role } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Alle Pflichtfelder müssen ausgefüllt sein' }, { status: 400 });
    }

    // Check if user exists
    const existing = await rawClient.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Ein Konto mit dieser E-Mail existiert bereits' }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const name = `${firstName} ${lastName}`;
    const passwordHash = await hashPassword(password);

    await rawClient.execute({
      sql: 'INSERT INTO users (id, email, name, password_hash, canton, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [id, email, name, passwordHash, canton || '', role || '', new Date().toISOString()],
    });

    // Also create default settings for the user
    // First ensure settings table exists
    await rawClient.execute(`CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Thomas Müller',
      title TEXT NOT NULL DEFAULT 'Gemeinderat',
      constituency TEXT NOT NULL DEFAULT 'Stadt Zürich',
      keywords TEXT NOT NULL DEFAULT '[]',
      language TEXT NOT NULL DEFAULT 'de',
      cantons TEXT NOT NULL DEFAULT '["ZH"]'
    )`);

    await rawClient.execute({
      sql: `INSERT OR IGNORE INTO settings (id, name, title, constituency, keywords, language, cantons) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, name, role || 'Gemeinderat', canton ? `Kanton ${canton}` : 'Stadt Zürich', JSON.stringify([lastName]), 'de', JSON.stringify(canton ? [canton] : ['ZH'])],
    });

    const token = await createSession(id);

    const response = NextResponse.json({ success: true, user: { id, name, email } });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen' }, { status: 500 });
  }
}
