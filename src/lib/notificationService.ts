import prisma from '@/lib/prisma';

export interface CreateNotificationParams {
  userId?: string | null; // null = all owners/admins
  type: 'ORDER' | 'STOCK' | 'TASK' | 'REVIEW' | 'MESSAGE' | 'SYSTEM';
  title: string;
  message: string;
  link?: string | null;
  metadata?: any;
}

/**
 * Dispatch an admin notification
 */
export async function createAdminNotification(params: CreateNotificationParams) {
  try {
    return await prisma.adminNotification.create({
      data: {
        userId: params.userId || null,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        metadata: params.metadata ? (typeof params.metadata === 'string' ? params.metadata : JSON.stringify(params.metadata)) : null,
      },
    });
  } catch (error) {
    console.error('Failed to create admin notification:', error);
    return null;
  }
}

/**
 * Auto-check store data (stock <= 3, pending orders) and create notifications if needed
 */
export async function checkAndGenerateStoreAlerts() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 1. Check low stock / out of stock products (stock <= 3)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        OR: [
          { stock: { lte: 3 } },
          { inStock: false },
        ],
      },
      select: {
        id: true,
        name: true,
        stock: true,
        inStock: true,
        brandLabel: true,
        slug: true,
      },
      take: 10,
    });

    for (const prod of lowStockProducts) {
      // Check if we already notified about this product today
      const alreadyNotified = await prisma.adminNotification.findFirst({
        where: {
          type: 'STOCK',
          metadata: { contains: `"productId":${prod.id}` },
          createdAt: { gte: todayStart },
        },
      });

      if (!alreadyNotified) {
        const isOutOfStock = prod.stock <= 0 || !prod.inStock;
        await prisma.adminNotification.create({
          data: {
            type: 'STOCK',
            title: isOutOfStock ? `Rupture de Stock : ${prod.name}` : `Stock Faible (${prod.stock} restant) : ${prod.name}`,
            message: isOutOfStock
              ? `Le produit ${prod.name} (${prod.brandLabel}) est épuisé. Pensez à réapprovisionner.`
              : `Il ne reste que ${prod.stock} unité(s) pour ${prod.name} (${prod.brandLabel}).`,
            link: '/admin/products',
            metadata: JSON.stringify({ productId: prod.id, stock: prod.stock, slug: prod.slug }),
          },
        });
      }
    }

    // 2. Check pending orders from the last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: oneDayAgo },
        status: { in: ['pending', 'PENDING'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const order of recentOrders) {
      const alreadyNotified = await prisma.adminNotification.findFirst({
        where: {
          type: 'ORDER',
          metadata: { contains: `"orderId":"${order.id}"` },
        },
      });

      if (!alreadyNotified) {
        await prisma.adminNotification.create({
          data: {
            type: 'ORDER',
            title: `Nouvelle Commande #${order.orderNumber} (${order.total} DH)`,
            message: `Commande de ${order.customerName} (${order.shippingCity}) en attente de traitement.`,
            link: '/admin/orders',
            metadata: JSON.stringify({ orderId: order.id, orderNumber: order.orderNumber, total: order.total }),
          },
        });
      }
    }
  } catch (err) {
    console.error('Error generating store alerts:', err);
  }
}
