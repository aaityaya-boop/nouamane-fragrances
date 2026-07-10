import React from 'react';
import prisma from '@/lib/prisma';
import { Users, Mail, Phone, MapPin, KeyRound, Calendar, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orders: true,
    }
  });

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#111] mb-2 tracking-tight">Clients</h1>
          <p className="text-[14px] text-[#666]">Consultez et gérez votre base de clients inscrits ({customers.length} au total).</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#eaeaea] hover:bg-gray-50 rounded-lg text-[13px] font-medium text-[#111] transition-colors shadow-sm">
          <Download size={16} className="text-[#666]" /> Exporter CSV
        </button>
      </div>

      <div className="bg-white border border-[#eaeaea] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[#666]">Client</th>
                <th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[#666]">Contact</th>
                <th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[#666]">Localisation</th>
                <th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[#666]">Activité (Commandes)</th>
                <th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[#666]">Sécurité & Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {customers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-[#666] text-[13px]">Aucun client enregistré pour le moment.</td></tr>
              ) : customers.map((customer) => {
                const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);

                return (
                  <tr key={customer.id} className="hover:bg-[#fafafa] transition-colors group cursor-default">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-[13px] font-bold text-gray-700 shadow-sm border border-white shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-[#111]">{customer.name}</div>
                          <div className="text-[11px] text-[#888] font-medium mt-0.5">ID: {customer.id.substring(0,8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[13px] text-[#111] mb-1.5 font-medium">
                        <Mail size={14} className="text-[#999]" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-[12px] text-[#666]">
                          <Phone size={14} className="text-[#999]" />
                          {customer.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {customer.city ? (
                        <div className="flex items-center gap-2 text-[13px] text-[#111] font-medium">
                          <MapPin size={14} className="text-[#0ea5e9]" />
                          {customer.city}
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#999] italic">Non renseignée</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[13px] font-bold text-[#111] mb-1">{customer.orders.length} commande(s)</div>
                      <div className="text-[12px] font-medium text-[#0ea5e9] bg-sky-50 inline-flex px-2 py-0.5 rounded-md ring-1 ring-inset ring-sky-500/20">
                        {totalSpent.toFixed(2)} MAD
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[12px] text-[#666] mb-1.5">
                        <KeyRound size={14} className="text-emerald-500" />
                        Mot de passe: <span className="tracking-widest">••••••••</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#666]">
                        <Calendar size={14} className="text-[#999]" />
                        Inscrit le {new Date(customer.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

