import { NextRequest, NextResponse } from 'next/server'
import { analyzeSentiment } from '@/lib/ai/sentiment'
import { mockDashboardData } from '@/data/mock'

export async function POST(request: NextRequest) {
  try {
    let mentionTexts: string[]

    // Accept mentions from request body, fall back to mock data
    try {
      const body = await request.json()
      if (Array.isArray(body.mentions) && body.mentions.length > 0) {
        mentionTexts = body.mentions
      } else {
        mentionTexts = mockDashboardData.mentions.map((m) => m.content)
      }
    } catch {
      mentionTexts = mockDashboardData.mentions.map((m) => m.content)
    }

    const results = await analyzeSentiment(mentionTexts)

    return NextResponse.json({
      success: true,
      analyzed: results.length,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    )
  }
}
