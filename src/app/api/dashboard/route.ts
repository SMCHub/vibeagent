import { NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/db/helpers';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    const data = await getDashboardData(user.userId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
