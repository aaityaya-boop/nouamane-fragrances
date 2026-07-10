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
    <div className="max-w-[1600px] mx-auto p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#111] mb-2 tracking-tight">Finance & Rapports</h1>
        <p className="text-[14px] text-[#666]">Analysez vos performances financières et vos meilleures ventes.</p>
      </div>

      <FinanceClient orders={serializedOrders} />
    </div>
  );
}
