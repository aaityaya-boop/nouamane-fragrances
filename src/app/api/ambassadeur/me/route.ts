import { NextResponse } from 'next/server';
import { getCurrentAmbassador } from '@/lib/affiliate-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ambassador = await getCurrentAmbassador();

    if (!ambassador) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Omit sensitive passwordHash before returning to client
    const { passwordHash, ...safeAmbassador } = ambassador;

    return NextResponse.json({
      success: true,
      ambassador: safeAmbassador,
    });
  } catch (error) {
    console.error('Error fetching ambassador session:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
