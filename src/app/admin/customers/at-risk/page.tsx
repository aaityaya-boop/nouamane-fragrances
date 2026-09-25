import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, MessageSquare, Phone } from 'lucide-react';
import { getUnifiedCustomers } from '@/lib/unifiedCustomers';
import { formatMAD } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function AtRiskCustomersPage() {
  const allCustomers = await getUnifiedCustomers();
  const now = new Date().getTime();

  // At-Risk criteria: has ordered in past, but last order was > 90 days ago
  const atRiskCustomers = allCustomers
    .filter((c) => {
      if (c.ordersCount === 0 || !c.lastOrderDate) return false;
      const daysSince = Math.floor((now - new Date(c.lastOrderDate).getTime()) / (1000 * 3600 * 24));
      return daysSince > 90;
    })
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
              Rétention & Relances
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-semibold">
              <AlertTriangle size={13} className="text-rose-600" />
              {atRiskCustomers.length} Clients À Réactiver
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <span>Clients à Risque de Départ (Inactifs &gt; 90 jours)</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Clients ayant déjà commandé dans le passé mais sans aucun achat depuis plus de 3 mois.
          </p>
        </div>

        <Link
          href="/admin/customers"
          className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors shadow-2xs inline-flex items-center gap-1.5"
        >
          ← Tous les clients
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="border-b border-neutral-100 bg-neutral-50/50 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600" />
            <h3 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider">
              File de Réactivation Clientèle
            </h3>
          </div>
          <span className="text-xs text-neutral-500">Relance directe WhatsApp en 1 clic</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Contact / WhatsApp</th>
                <th className="py-3 px-3 text-center">Commandes</th>
                <th className="py-3 px-3 text-right">CA Historique (LTV)</th>
                <th className="py-3 px-3">Dernier Achat</th>
                <th className="py-3 px-3 text-center">Jours d'Inactivité</th>
                <th className="py-3 px-4 text-right">Action Relance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {atRiskCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 text-xs">
                    Aucun client inactif à risque détecté. Tous vos clients sont récents ou actifs !
                  </td>
                </tr>
              ) : (
                atRiskCustomers.map((customer) => {
                  const daysSince = customer.lastOrderDate
                    ? Math.floor((now - new Date(customer.lastOrderDate).getTime()) / (1000 * 3600 * 24))
                    : 999;

                  const hasPhone = Boolean(customer.cleanPhone);
                  const formattedPhone = customer.cleanPhone.startsWith('0')
                    ? `212${customer.cleanPhone.slice(1)}`
                    : customer.cleanPhone.startsWith('212')
                    ? customer.cleanPhone
                    : `212${customer.cleanPhone}`;

                  const whatsappMsg = `Salam ${customer.name} 👋, cela fait un moment que nous n'avons pas eu de vos nouvelles chez NAY Parfum ! Pour fêter nos nouvelles arrivées de testeurs d'exception, nous avons le plaisir de vous réserver un échantillon offert sur votre prochaine commande ✨`;
                  const whatsappUrl = hasPhone && formattedPhone.length >= 9
                    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMsg)}`
                    : null;

                  return (
                    <tr key={customer.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{customer.name}</div>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {customer.city || 'Maroc'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {customer.phone ? (
                            <span className="font-mono font-semibold text-neutral-900 text-xs">
                              {customer.phone}
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic">Sans tel</span>
                          )}
                          {customer.email && (
                            <div className="text-[11px] text-neutral-500">{customer.email}</div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-neutral-900">
                        {customer.ordersCount}
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-neutral-900">
                        {formatMAD(customer.totalSpent)}
                      </td>

                      <td className="py-3.5 px-3 text-neutral-700">
                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('fr-FR') : '—'}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {daysSince} jours
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-md text-[11px] font-semibold transition-colors inline-flex items-center gap-1 shadow-2xs"
                            >
                              <MessageSquare size={11} />
                              <span>Relancer WhatsApp</span>
                            </a>
                          )}

                          <Link
                            href={`/admin/customers/${encodeURIComponent(customer.id)}`}
                            className="px-2.5 py-1 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-md text-[11px] font-medium transition-colors inline-flex items-center gap-1 shadow-2xs"
                          >
                            <span>Fiche</span>
                            <ArrowRight size={11} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
