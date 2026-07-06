import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Server-side validation
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Le nom, l\'email et le message sont requis' },
        { status: 400 }
      );
    }

    const message = await prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        message: body.message,
      }
    });

    return NextResponse.json({ success: true, id: message.id });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
