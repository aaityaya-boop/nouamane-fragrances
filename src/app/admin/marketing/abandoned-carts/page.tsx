import React from 'react';
import prisma from '@/lib/prisma';
import AbandonedCartsView from './AbandonedCartsView';

export const dynamic = 'force-dynamic';

export default async function AbandonedCartsPage() {
  const abandonedCarts = await prisma.abandonedCart.findMany({
    where: { status: { in: ['ABANDONED', 'ACTIVE'] } },
    include: { customer: true },
    orderBy: { lastActivity: 'desc' }
  });

  const serializedCarts = abandonedCarts.map(cart => ({
    id: cart.id,
    cartValue: cart.cartValue,
    status: cart.status,
    lastActivity: cart.lastActivity.toISOString(),
    cartItems: cart.cartItems,
    customer: {
      id: cart.customer.id,
      name: cart.customer.name,
      email: cart.customer.email,
      phone: cart.customer.phone,
      city: cart.customer.city
    }
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
            File de Récupération des Paniers Abandonnés
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Convertissez les intentions d'achat en ventes réelles grâce à la relance personnalisée WhatsApp et Email.
          </p>
        </div>
      </div>

      <AbandonedCartsView initialCarts={serializedCarts} />
    </div>
  );
}
