import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { createAdminNotification } from '@/lib/notificationService';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'GENERAL';
    const contactId = searchParams.get('contactId');

    const where: any = {};

    if (contactId) {
      // 1-to-1 direct conversation between admin and contactId
      where.OR = [
        { senderId: admin.id, recipientId: contactId },
        { senderId: contactId, recipientId: admin.id },
      ];
    } else {
      // Channel message (e.g. GENERAL, STOCK, ORDERS)
      where.channel = channel;
      where.recipientId = null;
    }

    const messages = await prisma.adminChatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    // Mark unread received messages as read
    if (contactId) {
      await prisma.adminChatMessage.updateMany({
        where: {
          senderId: contactId,
          recipientId: admin.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { content, channel = 'GENERAL', recipientId, attachments } = body;

    if ((!content || !content.trim()) && (!attachments || !attachments.length)) {
      return NextResponse.json({ error: 'Le message ne peut pas être vide' }, { status: 400 });
    }

    const newMessage = await prisma.adminChatMessage.create({
      data: {
        senderId: admin.id,
        senderName: admin.name,
        senderAvatar: admin.avatar,
        recipientId: recipientId || null,
        channel: recipientId ? 'DIRECT' : channel,
        content: content?.trim() || '',
        attachments: attachments ? (typeof attachments === 'string' ? attachments : JSON.stringify(attachments)) : null,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    // If direct message or channel, dispatch notification to other owners
    if (recipientId) {
      await createAdminNotification({
        userId: recipientId,
        type: 'MESSAGE',
        title: `Nouveau message de ${admin.name}`,
        message: content?.trim().slice(0, 80) || 'Vous a envoyé un fichier',
        link: '/admin/chat',
        metadata: { messageId: newMessage.id, senderId: admin.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 });
  }
}
