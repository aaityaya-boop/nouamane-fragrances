import React from 'react';
import Link from 'next/link';
import { Plus, Users, TrendingUp, DollarSign, Award, ExternalLink, Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatMAD } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function AffiliatesPage() {
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const totalRevenue = affiliates.reduce((sum, a) => sum + a.revenueGenerated, 0);
  const totalCommissions = affiliates.reduce((sum, a) => sum + a.commissionEarned, 0);
  const totalVisits = affiliates.reduce((sum, a) => sum + a.visits, 0);
  const totalSales = affiliates.reduce((sum, a) => sum + a.sales, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
              Marketing d&apos;Influence
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Award size={22} className="text-neutral-900" />
            <span>Programme Ambassadeurs</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gérez vos influenceurs, codes partenaires et suivez leurs commissions et performances.
          </p>
        </div>

        <Link 
          href="/admin/affiliates/new" 
          className="bg-neutral-900 text-white px-3.5 py-2 rounded-lg font-medium text-xs flex items-center gap-1.5 hover:bg-black transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>Nouvel Ambassadeur</span>
        </Link>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Visites Générées</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {totalVisits}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Ventes Conclues</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {totalSales}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">CA Total Généré</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {formatMAD(totalRevenue)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Commissions Dues</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {formatMAD(totalCommissions)}
          </div>
        </div>
      </div>

      {/* Affiliates List */}
      <div className="bg-white rounded-2xl shadow-2xs border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Liste des Ambassadeurs ({affiliates.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-5">Ambassadeur</th>
                <th className="py-3 px-4">Lien VIP</th>
                <th className="py-3 px-4">Commission</th>
                <th className="py-3 px-4">Visites</th>
                <th className="py-3 px-4">Ventes</th>
                <th className="py-3 px-4">Revenus & Dû</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-neutral-400">
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-neutral-700">Aucun ambassadeur enregistré</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Cliquez sur "Nouvel Ambassadeur" pour créer votre premier partenaire.</p>
                  </td>
                </tr>
              ) : (
                affiliates.map((aff) => (
                  <tr key={aff.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 sm:px-5 font-semibold text-neutral-900">{aff.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md w-max text-xs font-mono border border-neutral-200">
                        <span>/vip/{aff.code}</span>
                        <a href={`/vip/${aff.code}`} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-neutral-950">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-700">{aff.commissionRate}%</td>
                    <td className="py-3 px-4 text-neutral-600">{aff.visits}</td>
                    <td className="py-3 px-4 text-neutral-600">{aff.sales}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-neutral-900 font-semibold">{formatMAD(aff.revenueGenerated)}</span>
                        <span className="text-amber-700 text-[11px] font-medium">Dû: {formatMAD(aff.commissionEarned)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link 
                        href={`/admin/affiliates/${aff.id}`} 
                        className="inline-block px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg shadow-2xs transition-colors"
                      >
                        Gérer
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
