import React from 'react';
import prisma from '@/lib/prisma';
import FinanceClient from './FinanceClient';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  // Fetch all orders to compute stats
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      shippingCity: true,
      total: true,
      status: true,
      createdAt: true,
      shippingCost: true,
      discount: true,
      items: true,
    }
  });

  // Convert Date objects to strings for Client Component serialization
  const serializedOrders = orders.map(o => ({
    ...o,
    createdAt: o.createdAt.toISOString()
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="heading-font text-3xl font-medium text-[#1A1A1A] mb-2">Finance & Rapports</h1>
        <p className="text-[14px] text-[#6B6B6B]">Analysez vos performances financières et vos meilleures ventes.</p>
      </div>

      <FinanceClient orders={serializedOrders} />
    </div>
  );
}
