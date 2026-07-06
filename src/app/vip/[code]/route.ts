import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  
  // Find affiliate
  const affiliate = await prisma.affiliate.findUnique({
    where: { code }
  });

  // Always redirect to home if not found
  if (!affiliate) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Increment visits asynchronously
  try {
    await prisma.affiliate.update({
      where: { code },
      data: { visits: { increment: 1 } }
    });
  } catch (e) {
    console.error('Error incrementing affiliate visits:', e);
  }

  // Redirect to home and set cookie
  const response = NextResponse.redirect(new URL('/', request.url));
  
  // Cookie lasts 30 days
  response.cookies.set('affiliate_ref', code, {
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true, // we will read it on server side in API route or via getCookie if not httpOnly, but since we submit order via client fetch, we probably need it non-httpOnly OR the api route reads the cookie directly! Yes, the api/orders route reads cookies on the server!
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return response;
}
