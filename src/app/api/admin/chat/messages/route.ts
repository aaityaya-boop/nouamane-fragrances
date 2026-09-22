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

      // Reflect in returned array
      messages.forEach((m) => {
        if (m.senderId === contactId && m.recipientId === admin.id && !m.isRead) {
          m.isRead = true;
          m.readAt = new Date();
        }
      });
    } else {
      // Channel / Group chat: record that current admin has read messages from others
      const nowIso = new Date().toISOString();
      const updates: Promise<any>[] = [];

      for (const m of messages) {
        if (m.senderId !== admin.id) {
          let readers: Array<{ userId: string; userName: string; readAt: string }> = [];
          try {
            if (m.readBy) readers = JSON.parse(m.readBy);
          } catch {
            readers = [];
          }

          const alreadyRead = readers.some((r) => r.userId === admin.id);
          if (!alreadyRead) {
            readers.push({
              userId: admin.id,
              userName: admin.name,
              readAt: nowIso,
            });
            m.readBy = JSON.stringify(readers);
            m.isRead = true;
            m.readAt = new Date();

            updates.push(
              prisma.adminChatMessage.update({
                where: { id: m.id },
                data: {
                  readBy: m.readBy,
                  isRead: true,
                  readAt: new Date(),
                },
              }).catch(() => {})
            );
          }
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }
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
        isRead: false,
        readBy: JSON.stringify([{ userId: admin.id, userName: admin.name, readAt: new Date().toISOString() }]),
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
