import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export async function POST(){
  try {
    // Mock GSC Synchronization
    const today = new Date();

    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await prisma.seoSearchConsoleDaily.upsert({
        where: {
          date_device_country_searchType: {
            date,
            device: 'MOBILE',
            country: 'MAROC',
            searchType: 'WEB'
          }
        },
        update: {},
        create: {
          date,
          device: 'MOBILE',
          country: 'MAROC',
          searchType: 'WEB',
          clicks: Math.floor(Math.random() * 100) + 100,
          impressions: Math.floor(Math.random() * 1000) + 5000,
          ctr: Math.random() * 5 + 1,
          position: Math.random() * 20 + 1,
        }
      });
    }

    await prisma.seoSettings.upsert({
      where: { id: 'default' },
      update: {
        googleSearchConsoleConnected: true,
      },
      create: {
        id: 'default',
        googleSearchConsoleConnected: true,
      }
    });

    return NextResponse.json({ success: true, message: 'Sync complete' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
