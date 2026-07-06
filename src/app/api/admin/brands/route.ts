import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(brands);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { slug, name, label, description } = data;

    if (!slug || !name || !label || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newBrand = await prisma.brand.create({
      data: {
        slug,
        name,
        label,
        description
      }
    });
    return NextResponse.json(newBrand);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
