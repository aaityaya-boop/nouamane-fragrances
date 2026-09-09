import React from 'react';
import prisma from '@/lib/prisma';
import ContactsDirectoryClient, { CustomerContact } from './ContactsDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function ContactsDirectoryPage() {
  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        where: { status: 'delivered' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const formattedContacts: CustomerContact[] = customers.map(c => {
    const totalSpent = c.orders.reduce((sum, o) => sum + o.total, 0);
    const ordersCount = c.orders.length;
    const isVip = ordersCount >= 3 || totalSpent >= 2000;

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      city: c.city,
      address: c.address,
      postalCode: c.postalCode,
      ordersCount,
      totalSpent,
      createdAt: c.createdAt.toISOString(),
      isVip
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
            Répertoire Centralisé des Contacts & Clients
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Consultez tous les numéros de téléphone WhatsApp, adresses email et fiches de vos clients avec export CSV et copie rapide.
          </p>
        </div>
      </div>

      <ContactsDirectoryClient initialContacts={formattedContacts} />
    </div>
  );
}
