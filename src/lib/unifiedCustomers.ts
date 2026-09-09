import prisma from '@/lib/prisma';

export interface UnifiedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cleanPhone: string;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  ordersCount: number;
  deliveredOrdersCount: number;
  totalSpent: number;
  lastOrderDate: Date | null;
  createdAt: Date;
  isVip: boolean;
  tier: 'DIAMOND' | 'GOLD' | 'SILVER' | 'STANDARD';
  source: 'COMMANDE' | 'COMPTE' | 'COMMANDE_ET_COMPTE';
  recentOrderNumber: string | null;
}

export async function getUnifiedCustomers(): Promise<UnifiedCustomer[]> {
  const [allOrders, allCustomers] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.customer.findMany({
      include: { orders: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // Map to group by normalized phone or email
  const map = new Map<string, {
    customer?: typeof allCustomers[0];
    orders: typeof allOrders;
  }>();

  const getPhoneKey = (phone?: string | null) => {
    if (!phone) return '';
    const digits = phone.replace(/[^0-9]/g, '');
    if (!digits) return '';
    if (digits.startsWith('0')) return '212' + digits.slice(1);
    if (digits.startsWith('212')) return digits;
    return '212' + digits;
  };

  // 1. Process all registered Customers
  for (const c of allCustomers) {
    const phoneKey = getPhoneKey(c.phone);
    const emailKey = (c.email || '').toLowerCase().trim();
    const primaryKey = phoneKey || emailKey || `cust_${c.id}`;

    if (!map.has(primaryKey)) {
      map.set(primaryKey, { customer: c, orders: [] });
    } else {
      map.get(primaryKey)!.customer = c;
    }
  }

  // 2. Process all Orders (including guest checkouts)
  for (const o of allOrders) {
    const phoneKey = getPhoneKey(o.customerPhone);
    const emailKey = (o.customerEmail || '').toLowerCase().trim();
    const primaryKey = phoneKey || emailKey || `order_${o.id}`;

    if (!map.has(primaryKey)) {
      map.set(primaryKey, { orders: [o] });
    } else {
      // Avoid duplicate order push if customer relation was already counted
      const existing = map.get(primaryKey)!;
      if (!existing.orders.some(existingOrder => existingOrder.id === o.id)) {
        existing.orders.push(o);
      }
    }
  }

  // 3. Assemble unified customer objects
  const unified: UnifiedCustomer[] = [];

  for (const [key, data] of map.entries()) {
    const c = data.customer;
    const orders = data.orders;

    // Latest order info if exists
    const latestOrder = orders.length > 0 ? orders[0] : null;

    const name = (c?.name || latestOrder?.customerName || 'Client NAY').trim();
    const email = (c?.email || latestOrder?.customerEmail || '').trim();
    const phone = c?.phone || latestOrder?.customerPhone || null;
    const cleanPhone = getPhoneKey(phone);
    const city = latestOrder?.shippingCity || c?.city || null;
    const address = latestOrder?.shippingAddress || c?.address || null;
    const postalCode = latestOrder?.shippingPostalCode || c?.postalCode || null;

    const ordersCount = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const deliveredOrdersCount = deliveredOrders.length;
    
    // Total spent: delivered orders total if any, otherwise all orders total
    const totalSpent = deliveredOrdersCount > 0 
      ? deliveredOrders.reduce((sum, o) => sum + o.total, 0)
      : orders.reduce((sum, o) => sum + o.total, 0);

    const lastOrderDate = latestOrder ? new Date(latestOrder.createdAt) : (c ? new Date(c.createdAt) : null);
    const createdAt = c ? new Date(c.createdAt) : (latestOrder ? new Date(latestOrder.createdAt) : new Date());

    // VIP calculation
    let tier: 'DIAMOND' | 'GOLD' | 'SILVER' | 'STANDARD' = 'STANDARD';
    if (totalSpent >= 5000 || ordersCount >= 5) {
      tier = 'DIAMOND';
    } else if (totalSpent >= 2500 || ordersCount >= 3) {
      tier = 'GOLD';
    } else if (totalSpent >= 1000 || ordersCount >= 2) {
      tier = 'SILVER';
    }

    const isVip = tier !== 'STANDARD';

    let source: 'COMMANDE' | 'COMPTE' | 'COMMANDE_ET_COMPTE' = 'COMMANDE';
    if (c && orders.length > 0) {
      source = 'COMMANDE_ET_COMPTE';
    } else if (c) {
      source = 'COMPTE';
    }

    unified.push({
      id: c?.id || `cmd_${cleanPhone || email.replace(/[^a-zA-Z0-9]/g, '_') || latestOrder?.id || key}`,
      name,
      email,
      phone,
      cleanPhone,
      city,
      address,
      postalCode,
      ordersCount,
      deliveredOrdersCount,
      totalSpent,
      lastOrderDate,
      createdAt,
      isVip,
      tier,
      source,
      recentOrderNumber: latestOrder?.orderNumber || null
    });
  }

  // Sort by totalSpent desc, then ordersCount desc
  return unified.sort((a, b) => {
    if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
    return b.ordersCount - a.ordersCount;
  });
}
