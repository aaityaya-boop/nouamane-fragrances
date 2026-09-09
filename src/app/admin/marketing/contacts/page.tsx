import React from 'react';
import { getUnifiedCustomers } from '@/lib/unifiedCustomers';
import ContactsDirectoryClient, { CustomerContact } from './ContactsDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function ContactsDirectoryPage() {
  const unifiedCustomers = await getUnifiedCustomers();

  const formattedContacts: CustomerContact[] = unifiedCustomers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    cleanPhone: c.cleanPhone,
    city: c.city,
    address: c.address,
    postalCode: c.postalCode,
    ordersCount: c.ordersCount,
    deliveredOrdersCount: c.deliveredOrdersCount,
    totalSpent: c.totalSpent,
    lastOrderDate: c.lastOrderDate ? c.lastOrderDate.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    isVip: c.isVip,
    tier: c.tier,
    source: c.source,
    recentOrderNumber: c.recentOrderNumber
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
            Répertoire Centralisé : Clients & Commandes
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Consultez tous les numéros de téléphone WhatsApp, adresses email et adresses de livraison issus de toutes vos commandes et comptes clients.
          </p>
        </div>
      </div>

      <ContactsDirectoryClient initialContacts={formattedContacts} />
    </div>
  );
}
