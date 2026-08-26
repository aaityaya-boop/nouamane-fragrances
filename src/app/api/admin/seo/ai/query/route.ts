import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, aiEngine = 'chatgpt' } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    // Mocking Prisma creation for SeoAiQuery
    const mockQuery = {
      id: `query_${Date.now()}`,
      prompt,
      aiEngine,
      visibilityScore: 85,
      competitorMentions: ['CompetitorA', 'CompetitorB'],
      brandMentioned: true,
      sentiment: 'POSITIVE',
      analyzedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: mockQuery }, { status: 201 });
  } catch (error) {
    console.error('Error creating AI Query record:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
