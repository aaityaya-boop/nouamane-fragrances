import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { checkAndGenerateStoreAlerts } from '@/lib/notificationService';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Trigger alert checks (non-blocking background)
    checkAndGenerateStoreAlerts().catch(() => {});

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '30', 10), 1), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const type = searchParams.get('type') || 'ALL';
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: any = {
      OR: [
        { userId: null }, // broadcast to all
        { userId: admin.id }, // specific to this admin
      ],
    };

    if (type !== 'ALL') {
      where.type = type;
    }

    if (unreadOnly) {
      where.isRead = false;
    }

    const [total, unreadCount, notifications] = await Promise.all([
      prisma.adminNotification.count({ where }),
      prisma.adminNotification.count({
        where: {
          OR: [{ userId: null }, { userId: admin.id }],
          isRead: false,
        },
      }),
      prisma.adminNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { id, all } = body;

    if (all) {
      // Mark all as read for this admin / global
      await prisma.adminNotification.updateMany({
        where: {
          OR: [{ userId: null }, { userId: admin.id }],
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues',
      });
    }

    if (id) {
      await prisma.adminNotification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Notification marquée comme lue',
      });
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  } catch (error) {
    console.error('Error updating admin notifications:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour des notifications' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { id, clearRead } = body;

    if (clearRead) {
      await prisma.adminNotification.deleteMany({
        where: {
          OR: [{ userId: null }, { userId: admin.id }],
          isRead: true,
        },
      });
      return NextResponse.json({ success: true, message: 'Notifications lues supprimées' });
    }

    if (id) {
      await prisma.adminNotification.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Notification supprimée' });
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting admin notifications:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
