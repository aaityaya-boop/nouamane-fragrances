import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { topic = 'Default Topic' } = body;

    // Create a mock SeoOpportunity with type AI_CONTENT_GAP
    const mockOpportunity = {
      id: `opp_${Date.now()}`,
      type: 'AI_CONTENT_GAP',
      topic,
      searchVolume: 12500,
      difficulty: 'MEDIUM',
      potentialTraffic: 3000,
      intent: 'INFORMATIONAL',
      status: 'NEW',
      competitorsRanking: ['example.com', 'test.com'],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: mockOpportunity }, { status: 201 });
  } catch (error) {
    console.error('Error creating content gap opportunity:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
