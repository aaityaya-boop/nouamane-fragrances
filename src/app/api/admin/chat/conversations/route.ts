import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 1. Get other admin users
    const otherUsers = await prisma.adminUser.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: admin.id },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        lastActivityAt: true,
        lastLoginAt: true,
      },
    });

    // 2. Compute last message and unread count for each contact
    const contactsWithMeta = await Promise.all(
      otherUsers.map(async (u) => {
        const lastMsg = await prisma.adminChatMessage.findFirst({
          where: {
            OR: [
              { senderId: admin.id, recipientId: u.id },
              { senderId: u.id, recipientId: admin.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await prisma.adminChatMessage.count({
          where: {
            senderId: u.id,
            recipientId: admin.id,
            isRead: false,
          },
        });

        return {
          ...u,
          lastMessage: lastMsg,
          unreadCount,
        };
      })
    );

    // 3. Channels overview (GENERAL, STOCK, ORDERS)
    const channels = [
      {
        id: 'GENERAL',
        name: 'Salon Général NAY',
        description: 'Discussion libre entre associés et équipe',
        type: 'CHANNEL',
      },
      {
        id: 'STOCK',
        name: 'Canal Stock & Testeurs',
        description: 'Alertes de réassort, flacons et emballages',
        type: 'CHANNEL',
      },
      {
        id: 'ORDERS',
        name: 'Canal Commandes & VIP',
        description: 'Suivi des grosses commandes et clients VIP',
        type: 'CHANNEL',
      },
    ];

    const channelsWithMeta = await Promise.all(
      channels.map(async (c) => {
        const lastMsg = await prisma.adminChatMessage.findFirst({
          where: { channel: c.id, recipientId: null },
          orderBy: { createdAt: 'desc' },
        });

        return {
          ...c,
          lastMessage: lastMsg,
        };
      })
    );

    return NextResponse.json({
      success: true,
      contacts: contactsWithMeta,
      channels: channelsWithMeta,
    });
  } catch (error) {
    console.error('Error fetching chat conversations:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des conversations' }, { status: 500 });
  }
}
