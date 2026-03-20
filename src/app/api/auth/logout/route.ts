import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/session=([^;]+)/);
  if (match) {
    await deleteSession(match[1]);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
