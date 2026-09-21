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
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '30', 10), 1), 100);

    // Fetch real-time alerts from database
    const [pendingOrders, lowStockProducts, assignedTasks] = await Promise.all([
      prisma.order.findMany({
        where: { status: { in: ['pending', 'unconfirmed'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: 'asc' },
        take: 10,
        select: { id: true, name: true, stock: true, updatedAt: true },
      }),
      prisma.adminTask.findMany({
        where: {
          OR: [
            { assignedToId: admin.id },
            { assignedToId: null },
          ],
          status: { in: ['TODO', 'IN_PROGRESS'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const notifications: any[] = [];

    // Map pending orders
    pendingOrders.forEach((o) => {
      notifications.push({
        id: `order_${o.id}`,
        type: 'ORDER',
        title: `Nouvelle commande #${o.orderNumber}`,
        message: `${o.customerName} a passé commande (${o.shippingCity || 'Maroc'}) - ${o.total} MAD`,
        link: '/admin/orders',
        isRead: false,
        createdAt: o.createdAt,
      });
    });

    // Map low stock products
    lowStockProducts.forEach((p) => {
      notifications.push({
        id: `stock_${p.id}`,
        type: 'STOCK',
        title: p.stock === 0 ? `Rupture de stock : ${p.name}` : `Alerte stock faible : ${p.name}`,
        message: p.stock === 0 ? `Le produit est épuisé.` : `Plus que ${p.stock} unité(s) en réserve atelier.`,
        link: '/admin/inventory',
        isRead: false,
        createdAt: p.updatedAt,
      });
    });

    // Map tasks
    assignedTasks.forEach((t) => {
      notifications.push({
        id: `task_${t.id}`,
        type: 'TASK',
        title: `Mission : ${t.title}`,
        message: `Priorité ${t.priority} • Statut: ${t.status}`,
        link: '/admin/tasks',
        isRead: false,
        createdAt: t.createdAt,
      });
    });

    // Sort by date desc
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const sliced = notifications.slice(0, limit);

    return NextResponse.json({
      success: true,
      notifications: sliced,
      unreadCount: sliced.length,
      pagination: {
        page: 1,
        limit,
        total: notifications.length,
        totalPages: Math.ceil(notifications.length / limit) || 1,
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
