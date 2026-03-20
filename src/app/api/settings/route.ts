import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db/helpers';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    const settings = await getSettings(user.userId);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    const body = await request.json();
    await saveSettings(body, user.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
