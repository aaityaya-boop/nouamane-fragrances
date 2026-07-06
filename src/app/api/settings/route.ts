import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.siteConfig.findFirst();
    
    if (!config) {
      return NextResponse.json({});
    }

    // Exclude adminPassword from public API
    const { adminPassword, ...publicConfig } = config;

    return NextResponse.json(publicConfig);
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
