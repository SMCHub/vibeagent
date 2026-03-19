import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/ai/responder'
import { mockDashboardData } from '@/data/mock'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mentionId } = body as { mentionId: string }

    if (!mentionId) {
      return NextResponse.json(
        { success: false, error: 'mentionId ist erforderlich' },
        { status: 400 },
      )
    }

    const mention = mockDashboardData.mentions.find((m) => m.id === mentionId)
    if (!mention) {
      return NextResponse.json(
        { success: false, error: 'Erwähnung nicht gefunden' },
        { status: 404 },
      )
    }

    const response = await generateResponse(mention, mention.platform)

    return NextResponse.json({
      success: true,
      mentionId,
      response,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    )
  }
}
