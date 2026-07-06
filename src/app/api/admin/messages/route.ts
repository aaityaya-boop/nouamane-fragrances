import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
