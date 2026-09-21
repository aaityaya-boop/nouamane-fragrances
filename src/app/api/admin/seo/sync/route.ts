import { NextResponse } from 'next/server';
import { syncMoroccoSeoEngine } from '@/lib/seo/seedMoroccoSeo';

export async function POST() {
  try {
    const result = await syncMoroccoSeoEngine();
    return NextResponse.json({
      success: true,
      message: 'Moteur SEO Maroc synchronisé avec succès.',
      result
    });
  } catch (error) {
    console.error('SEO Sync API Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
