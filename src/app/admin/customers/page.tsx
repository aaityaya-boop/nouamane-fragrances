import React from 'react';
import prisma from '@/lib/prisma';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Extract unique customers based on email or phone
  const uniqueCustomersMap = new Map();
  orders.forEach((order) => {
    const key = order.customerEmail || order.customerPhone;
    if (!uniqueCustomersMap.has(key)) {
      uniqueCustomersMap.set(key, {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        city: order.shippingCity,
        orderCount: 1,
        totalSpent: order.total,
        lastOrder: order.createdAt,
      });
    } else {
      const existing = uniqueCustomersMap.get(key);
      existing.orderCount += 1;
      existing.totalSpent += order.total;
      if (order.createdAt > existing.lastOrder) {
        existing.lastOrder = order.createdAt;
      }
    }
  });

  const customers = Array.from(uniqueCustomersMap.values());

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="heading-font text-3xl font-medium text-[#1A1A1A] mb-2">Base Clients</h1>
        <p className="text-[14px] text-[#6B6B6B]">Gérez votre liste de clients et leur historique d'achat.</p>
      </div>

      <div className="bg-white border border-[#e0ddd4] rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafaf7] border-b border-[#e0ddd4]">
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A]">Client</th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A]">Contact</th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A]">Localisation</th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A]">Commandes</th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A]">Total Dépensé</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-[#9A9A9A]">Aucun client pour le moment.</td></tr>
            ) : customers.map((customer, i) => (
              <tr key={i} className="border-b border-[#e0ddd4] hover:bg-[#fafaf7]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f4f4f0] text-[#1A1A1A] flex items-center justify-center font-bold text-[14px]">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-[14px] font-medium text-[#1A1A1A]">{customer.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[13px] text-[#6B6B6B] mb-1">
                    <Mail size={14} className="text-[#9A9A9A]" />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#6B6B6B]">
                    <Phone size={14} className="text-[#9A9A9A]" />
                    {customer.phone}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[13px] text-[#1A1A1A]">
                    <MapPin size={14} className="text-[#9A9A9A]" />
                    {customer.city}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[13px] font-medium text-[#1A1A1A]">{customer.orderCount} commande(s)</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[13px] font-semibold text-[#0ea5e9]">{customer.totalSpent.toFixed(2)} MAD</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
