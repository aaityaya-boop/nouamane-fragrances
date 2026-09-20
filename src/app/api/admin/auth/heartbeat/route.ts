import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const now = new Date();
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        lastActivityAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      userId: admin.id,
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Heartbeat error' }, { status: 500 });
  }
}
