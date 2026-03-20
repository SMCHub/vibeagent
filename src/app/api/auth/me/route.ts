import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }
  return NextResponse.json({ user });
}
