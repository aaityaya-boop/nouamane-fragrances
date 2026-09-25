import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Build Prisma query
    const where: any = {
      OR: [{ userId: null }, { userId: admin.id }],
    };

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (unreadOnly) {
      where.isRead = false;
    }

    // Check if any notifications exist in DB
    const totalCount = await prisma.adminNotification.count({
      where: {
        OR: [{ userId: null }, { userId: admin.id }],
      },
    });

    // If completely empty on first run, seed initial real notifications from actual store orders
    if (totalCount === 0) {
      const recentOrders = await prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
      });

      for (const order of recentOrders) {
        await prisma.adminNotification.create({
          data: {
            type: 'ORDER',
            title: `Nouvelle commande #${order.orderNumber}`,
            message: `${order.customerName} a passé commande (${order.shippingCity || 'Maroc'}) - ${order.total} MAD`,
            link: '/admin/orders',
            isRead: false,
            createdAt: order.createdAt,
          },
        });
      }
    }

    // Fetch real persistent notifications
    const [notifications, unreadCount] = await Promise.all([
      prisma.adminNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.adminNotification.count({
        where: {
          OR: [{ userId: null }, { userId: admin.id }],
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
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
