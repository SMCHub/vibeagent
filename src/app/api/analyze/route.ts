import { NextResponse } from 'next/server'
import { analyzeSentiment } from '@/lib/ai/sentiment'
import { mockDashboardData } from '@/data/mock'

export async function POST() {
  try {
    const mentionTexts = mockDashboardData.mentions.map((m) => m.content)

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
