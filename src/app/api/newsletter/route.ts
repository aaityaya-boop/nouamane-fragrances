import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà inscrit' }, { status: 400 });
    }

    await prisma.newsletterSubscriber.create({
      data: { email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
