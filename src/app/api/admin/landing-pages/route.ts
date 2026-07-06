import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const pages = await prisma.landingPage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const page = await prisma.landingPage.create({
      data: {
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle,
        heroImage: body.heroImage,
        deadline: body.deadline ? new Date(body.deadline) : null,
        badgeText: body.badgeText,
        productSlugs: JSON.stringify(body.productSlugs || []),
        status: body.status || 'draft'
      }
    });
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
