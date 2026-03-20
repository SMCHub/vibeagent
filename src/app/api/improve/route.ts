import { NextRequest, NextResponse } from 'next/server';
import { improveResponse } from '@/lib/ai/responder';
import { getResponseByMentionId, updateResponseImproved, getMentionById } from '@/lib/db/helpers';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const body = await request.json();
    const { mentionId, feedback } = body as {
      mentionId: string;
      feedback?: string;
    };

    if (!mentionId) {
      return NextResponse.json(
        { success: false, error: 'mentionId ist erforderlich' },
        { status: 400 },
      );
    }

    // Verify the mention belongs to the user
    const mention = await getMentionById(mentionId);
    if (!mention || mention.politicianId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Erwähnung nicht gefunden' },
        { status: 404 },
      );
    }

    // Look up the current response for this mention from the DB
    const existingResponse = await getResponseByMentionId(mentionId);
    const currentText =
      existingResponse?.improvedText ?? existingResponse?.generatedText;

    if (!currentText) {
      return NextResponse.json(
        {
          success: false,
          error: 'Keine bestehende Antwort für diese Erwähnung gefunden',
        },
        { status: 404 },
      );
    }

    const improved = await improveResponse(currentText, feedback);

    // Save the improved text back to the DB
    await updateResponseImproved(mentionId, improved);

    return NextResponse.json({
      success: true,
      mentionId,
      response: improved,
    });
  } catch (error) {
    console.error('[/api/improve] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
