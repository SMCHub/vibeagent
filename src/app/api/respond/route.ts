import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/lib/ai/responder';
import { getMentionById, insertResponse } from '@/lib/db/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentionId } = body as { mentionId: string };

    if (!mentionId) {
      return NextResponse.json(
        { success: false, error: 'mentionId ist erforderlich' },
        { status: 400 },
      );
    }

    const mention = getMentionById(mentionId);
    if (!mention) {
      return NextResponse.json(
        { success: false, error: 'Erwähnung nicht gefunden' },
        { status: 404 },
      );
    }

    const responseText = await generateResponse(mention, mention.platform);

    // Save the generated response to the DB
    const responseId = `res-${mentionId}-${Date.now()}`;
    insertResponse({
      id: responseId,
      mentionId,
      generatedText: responseText,
    });

    return NextResponse.json({
      success: true,
      mentionId,
      response: responseText,
    });
  } catch (error) {
    console.error('[/api/respond] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
