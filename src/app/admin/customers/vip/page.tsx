import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function VipCustomersPage() {
  const allCustomers = await prisma.customer.findMany({
    include: { orders: { where: { status: 'delivered' }, orderBy: { createdAt: 'desc' } } }
  });

  const processed = allCustomers.map(c => {
    const spent = c.orders.reduce((sum, o) => sum + o.total, 0);
    const count = c.orders.length;
    const aov = count > 0 ? (spent / count).toFixed(2) : 0;
    const lastOrder = count > 0 ? c.orders[0] : null;
    return { ...c, spent, count, aov, lastOrder };
  });

  // VIP Criteria: Top 20 by spending OR > 3 orders
  const vipCustomers = processed
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 50);

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto text-neutral-900 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <span>Clients VIP</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Top Acheteurs
            </span>
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">Meilleurs acheteurs et plus forte valeur vie client ({vipCustomers.length} clients VIP).</p>
        </div>
        
        <Link 
          href="/admin/customers"
          className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-2xs inline-flex items-center gap-1.5"
        >
          Tous les clients
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="border-b border-neutral-100 bg-neutral-50/50 px-5 py-3.5 flex items-center gap-2">
          <Star size={16} className="text-amber-500 fill-amber-400" />
          <h3 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider">Classement des 50 Meilleurs Clients</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Rang</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Commandes</th>
                <th className="px-5 py-3">Total Dépensé (LTV)</th>
                <th className="px-5 py-3">Panier Moyen</th>
                <th className="px-5 py-3">Dernière Commande</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {vipCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-neutral-400 text-xs">Aucun client VIP détecté pour le moment.</td>
                </tr>
              ) : (
                vipCustomers.map((customer, idx) => (
                  <tr key={customer.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        idx === 1 ? 'bg-neutral-200 text-neutral-800' :
                        idx === 2 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'text-neutral-400'
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-neutral-900">{customer.name}</div>
                      <div className="text-[11px] text-neutral-500">{customer.email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-neutral-900">{customer.count}</td>
                    <td className="px-5 py-3.5 font-bold text-neutral-900">{customer.spent.toLocaleString()} <span className="text-xs font-normal text-neutral-500">MAD</span></td>
                    <td className="px-5 py-3.5 text-neutral-600 font-medium">{customer.aov} MAD</td>
                    <td className="px-5 py-3.5 text-neutral-500 text-xs">
                      {customer.lastOrder ? new Date(customer.lastOrder.createdAt).toLocaleDateString('fr-MA') : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/admin/customers/${customer.id}`} className="text-neutral-900 hover:underline text-xs font-semibold inline-flex items-center gap-1">
                        Profil <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
