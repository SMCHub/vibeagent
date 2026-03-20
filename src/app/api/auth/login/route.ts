import { NextResponse } from 'next/server';
import { verifyPassword, createSession, ensureAuthTables } from '@/lib/auth';
import { rawClient } from '@/lib/db/index';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await ensureAuthTables();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-Mail und Passwort sind erforderlich' }, { status: 400 });
    }

    const result = await rawClient.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 });
    }

    const valid = await verifyPassword(password, String(user.password_hash));
    if (!valid) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 });
    }

    const token = await createSession(String(user.id));

    const response = NextResponse.json({
      success: true,
      user: { id: String(user.id), name: String(user.name), email: String(user.email) },
    });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Anmeldung fehlgeschlagen' }, { status: 500 });
  }
}
