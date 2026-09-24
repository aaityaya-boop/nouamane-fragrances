import { NextResponse } from 'next/server';
import { syncAllAdIntegrations } from '@/lib/ads/ad-sync-service';

export async function POST() {
  try {
    const results = await syncAllAdIntegrations();
    return NextResponse.json({
      success: true,
      results,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error during ads sync:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
