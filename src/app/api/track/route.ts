import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { pathname } = await req.json();
    
    // Get IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    
    // Hash IP for privacy
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // Get Country/City using a free IP API (only if it's not localhost)
    let country = 'Inconnu';
    let city = 'Inconnu';

    if (ip !== '127.0.0.1' && ip !== '::1') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
        const geoData = await geoRes.json();
        if (geoData.country) country = geoData.country;
        if (geoData.city) city = geoData.city;
      } catch (e) {
        // Silently fail geo IP
      }
    } else {
      country = 'Local';
      city = 'Localhost';
    }

    // Upsert Visitor
    const visitor = await prisma.visitor.upsert({
      where: { ipHash },
      update: { lastSeen: new Date() },
      create: {
        ipHash,
        country,
        city,
      }
    });

    // Record PageView
    await prisma.pageView.create({
      data: {
        visitorId: visitor.id,
        pathname: pathname || '/',
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
