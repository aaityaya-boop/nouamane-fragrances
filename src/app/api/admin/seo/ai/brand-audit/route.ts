import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { brandName = 'OurBrand' } = body;

    // Return a mock brand consistency audit result
    const mockBrandAudit = {
      id: `brandaudit_${Date.now()}`,
      brandName,
      consistencyScore: 92,
      sentimentScore: 88,
      hallucinationRisk: 'LOW',
      findings: [
        { aspect: 'Tone of Voice', status: 'PASS', details: 'Consistent professional tone detected across simulated LLM queries.' },
        { aspect: 'Key Messaging', status: 'WARN', details: 'Some older product names are still being surfaced by AI.' },
        { aspect: 'Value Proposition', status: 'PASS', details: 'Core value proposition is clearly understood by AI engines.' }
      ],
      auditedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: mockBrandAudit }, { status: 201 });
  } catch (error) {
    console.error('Error running brand audit:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
