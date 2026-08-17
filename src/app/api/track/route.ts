import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { pathname, referrer, userAgent } = await req.json();
    
    // Parse device from userAgent
    let device = 'Desktop';
    if (userAgent) {
      if (/mobile/i.test(userAgent)) device = 'Mobile';
      if (/ipad|tablet/i.test(userAgent)) device = 'Tablet';
    }

    // Clean up referrer
    let cleanReferrer = 'Direct';
    if (referrer) {
      try {
        const url = new URL(referrer);
        if (url.hostname.includes('google')) cleanReferrer = 'Google';
        else if (url.hostname.includes('instagram')) cleanReferrer = 'Instagram';
        else if (url.hostname.includes('facebook')) cleanReferrer = 'Facebook';
        else if (url.hostname.includes('tiktok')) cleanReferrer = 'TikTok';
        else if (url.hostname === 'localhost' || url.hostname.includes('nayparfum.ma')) cleanReferrer = 'Interne';
        else cleanReferrer = url.hostname;
      } catch (e) {
        cleanReferrer = 'Direct';
      }
    }

    // Get IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    
    // Hash IP for privacy
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // Get Country/City using Vercel headers (silent and automatic, no prompt)
    let country = req.headers.get('x-vercel-ip-country') || 'Inconnu';
    let city = req.headers.get('x-vercel-ip-city') || 'Inconnu';

    if (ip === '127.0.0.1' || ip === '::1') {
      country = 'Local';
      city = 'Localhost';
    }

    // Decode URI component for city just in case Vercel encodes it
    try {
      city = decodeURIComponent(city);
    } catch(e) {}

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
        referrer: cleanReferrer,
        device: device,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
