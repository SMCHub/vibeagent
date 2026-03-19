import { NextRequest, NextResponse } from 'next/server'
import { improveResponse } from '@/lib/ai/responder'
import { mockDashboardData } from '@/data/mock'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mentionId, feedback } = body as {
      mentionId: string
      feedback?: string
    }

    if (!mentionId) {
      return NextResponse.json(
        { success: false, error: 'mentionId ist erforderlich' },
        { status: 400 },
      )
    }

    // Look up the current response for this mention
    const existingResponse = mockDashboardData.responses[mentionId]
    const currentText = existingResponse?.improvedText ?? existingResponse?.generatedText

    if (!currentText) {
      return NextResponse.json(
        { success: false, error: 'Keine bestehende Antwort für diese Erwähnung gefunden' },
        { status: 404 },
      )
    }

    const improved = await improveResponse(currentText, feedback)

    return NextResponse.json({
      success: true,
      mentionId,
      response: improved,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    )
  }
}
