import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const opportunities = await prisma.seoOpportunity.findMany({
      where: { type: 'AI_CONTENT_GAP' },
      orderBy: { priority: 'desc' },
      take: 50,
    });
    return NextResponse.json({ success: true, opportunities });
  } catch (error) {
    console.error('Error fetching content gap opportunities:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

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
