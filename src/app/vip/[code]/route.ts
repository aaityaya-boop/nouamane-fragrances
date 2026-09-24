import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const normalizedCode = (code || '').toLowerCase().trim();

  // Find affiliate
  const affiliate = await prisma.affiliate.findUnique({
    where: { code: normalizedCode }
  });

  // Always redirect to home if not found
  if (!affiliate || affiliate.status !== 'ACTIVE') {
    return NextResponse.redirect(new URL('/fr', request.url));
  }

  // Extract metadata
  const userAgent = request.headers.get('user-agent') || '';
  const referrer = request.headers.get('referer') || 'Direct';
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0].trim() || 'unknown';
  const ipHash = crypto.createHash('md5').update(ip).digest('hex');

  // Detect device
  let device = 'DESKTOP';
  if (/mobile|iphone|android|ipad/i.test(userAgent)) {
    device = /ipad|tablet/i.test(userAgent) ? 'TABLET' : 'MOBILE';
  }

  // Calculate visit commission if payPerVisit is configured
  const clickCommission = affiliate.payPerVisit > 0 ? affiliate.payPerVisit : 0;

  // Log real click and increment counters asynchronously
  try {
    await prisma.$transaction([
      prisma.affiliateClick.create({
        data: {
          affiliateId: affiliate.id,
          ipHash,
          device,
          referrer: referrer.length > 250 ? referrer.slice(0, 250) : referrer,
          landingPath: '/vip/' + normalizedCode,
        }
      }),
      prisma.affiliate.update({
        where: { id: affiliate.id },
        data: {
          visits: { increment: 1 },
          ...(clickCommission > 0 ? { commissionEarned: { increment: clickCommission } } : {})
        }
      })
    ]);
  } catch (e) {
    console.error('Error logging affiliate click:', e);
  }

  // Redirect to home and set 30-day affiliate cookie
  const response = NextResponse.redirect(new URL('/fr?ref=' + normalizedCode, request.url));
  
  response.cookies.set('affiliate_ref', normalizedCode, {
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days cookie window
    httpOnly: false, // Accessible for client widgets and server actions
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return response;
}
