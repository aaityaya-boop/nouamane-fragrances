import React from 'react';
import Link from 'next/link';
import { PieChart, ArrowRight, Users, Sparkles } from 'lucide-react';
import { getUnifiedCustomers } from '@/lib/unifiedCustomers';
import { formatMAD } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function CustomerSegmentsPage() {
  const allCustomers = await getUnifiedCustomers();

  const segments = {
    champions: {
      name: 'Champions VIP',
      count: 0,
      revenue: 0,
      filter: 'vip',
      desc: 'Achats récents, commandes fréquentes (>3) et plus forte valeur vie (LTV).',
      badge: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    loyal: {
      name: 'Clients Fidèles',
      count: 0,
      revenue: 0,
      filter: 'returning',
      desc: 'Clients ayant commandé au moins 2 fois avec réachat régulier.',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    new: {
      name: 'Nouveaux Acheteurs',
      count: 0,
      revenue: 0,
      filter: 'new',
      desc: 'Première commande passée récemment.',
      badge: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    guest: {
      name: 'Commandes Directes (Invités)',
      count: 0,
      revenue: 0,
      filter: 'guest',
      desc: 'Commandes passées directement par téléphone/email sans création de mot de passe.',
      badge: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    },
    atRisk: {
      name: 'Clients À Réactiver (Inactifs 90j+)',
      count: 0,
      revenue: 0,
      filter: 'orders',
      desc: 'Anciens acheteurs dont la dernière commande remonte à plus de 3 mois.',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    noOrder: {
      name: 'Inscrits Sans Achat',
      count: 0,
      revenue: 0,
      filter: 'no_orders',
      desc: 'Comptes enregistrés sur le site sans avoir encore validé de commande.',
      badge: 'bg-neutral-50 text-neutral-600 border-neutral-200',
    },
  };

  const now = new Date().getTime();

  allCustomers.forEach((c) => {
    const count = c.ordersCount;
    const spent = c.totalSpent;

    if (count === 0) {
      segments.noOrder.count++;
      return;
    }

    if (c.source === 'COMMANDE') {
      segments.guest.count++;
      segments.guest.revenue += spent;
    }

    const lastOrderDate = c.lastOrderDate ? new Date(c.lastOrderDate).getTime() : now;
    const daysSince = Math.floor((now - lastOrderDate) / (1000 * 3600 * 24));

    if (daysSince <= 45 && (count >= 3 || spent >= 2500)) {
      segments.champions.count++;
      segments.champions.revenue += spent;
    } else if (count >= 2) {
      segments.loyal.count++;
      segments.loyal.revenue += spent;
    } else if (daysSince <= 60 && count === 1) {
      segments.new.count++;
      segments.new.revenue += spent;
    }

    if (daysSince > 90 && count >= 1) {
      segments.atRisk.count++;
      segments.atRisk.revenue += spent;
    }
  });

  const segmentKeys = Object.keys(segments) as Array<keyof typeof segments>;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
              Segmentation Marketing RFM
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <PieChart size={22} className="text-neutral-900" />
            <span>Segmentation des Audiences ({allCustomers.length} clients)</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Regroupement automatique basé sur la Récence, la Fréquence et le Montant dépensé (LTV).
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
        <div className="border-b border-neutral-100 bg-neutral-50/50 px-5 py-3.5 flex items-center gap-2">
          <PieChart size={16} className="text-neutral-700" />
          <h3 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider">
            Segments Clients & Chiffre d'Affaires Associé
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Segment Audience</th>
                <th className="py-3 px-4 text-center">Volume Clients</th>
                <th className="py-3 px-4 text-right">CA Attribué (MAD)</th>
                <th className="py-3 px-4 text-right">Action Marketing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {segmentKeys.map((key) => {
                const seg = segments[key];
                return (
                  <tr key={key} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900">{seg.name}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{seg.desc}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${seg.badge}`}>
                        {seg.count} client{seg.count > 1 ? 's' : ''}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-neutral-900">
                      {seg.revenue > 0 ? formatMAD(seg.revenue) : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/customers?filter=${seg.filter}`}
                        className="px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <span>Voir la liste</span>
                        <ArrowRight size={12} />
                      </Link>
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
