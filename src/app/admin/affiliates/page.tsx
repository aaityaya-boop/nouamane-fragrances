import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  TrendingUp,
  DollarSign,
  Award,
  ExternalLink,
  Sparkles,
  Share2,
  Percent,
  Wallet,
  ShieldCheck,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatMAD } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function AffiliatesPage() {
  const affiliates = await prisma.affiliate.findMany({
    include: {
      _count: {
        select: {
          orders: true,
          clicks: true,
          leadsList: true,
          payouts: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = affiliates.reduce((sum, a) => sum + (a.revenueGenerated || 0), 0);
  const totalCommissions = affiliates.reduce((sum, a) => sum + (a.commissionEarned || 0), 0);
  const totalPaid = affiliates.reduce((sum, a) => sum + (a.commissionPaid || 0), 0);
  const totalPending = Math.max(0, totalCommissions - totalPaid);
  const totalVisits = affiliates.reduce((sum, a) => sum + (a.visits || 0), 0);
  const totalSales = affiliates.reduce((sum, a) => sum + (a.sales || 0), 0);
  const totalLeads = affiliates.reduce((sum, a) => sum + (a.leads || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              Marketing d&apos;Influence & Partenaires
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Award size={22} className="text-amber-600" />
            <span>Programme Ambassadeurs & Influenceurs</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gérez vos créateurs de contenu, liens VIP, modèles de rémunération et portail partenaires dédié.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/fr/ambassadeur"
            target="_blank"
            className="bg-white text-neutral-800 border border-neutral-200 px-3.5 py-2 rounded-lg font-medium text-xs flex items-center gap-1.5 hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <ExternalLink size={14} className="text-amber-600" />
            <span>Ouvrir Portail Ambassadeur</span>
          </Link>

          <Link
            href="/admin/affiliates/new"
            className="bg-neutral-900 text-white px-3.5 py-2 rounded-lg font-medium text-xs flex items-center gap-1.5 hover:bg-black transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Nouvel Ambassadeur</span>
          </Link>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Visites / Clics</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{totalVisits}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Trafic généré</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Leads / Inscrits</span>
          <div className="text-2xl font-bold text-purple-700 mt-1">{totalLeads}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Emails & Inscriptions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Ventes Conclues</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{totalSales}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Commandes passées</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">CA Total Généré</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{formatMAD(totalRevenue)}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Chiffre d'Affaires</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Commissions Dues</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{formatMAD(totalPending)}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Reste à payer</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Déjà Réglé</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{formatMAD(totalPaid)}</div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Virements effectués</span>
        </div>
      </div>

      {/* Affiliates List */}
      <div className="bg-white rounded-2xl shadow-2xs border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Liste des Ambassadeurs Partenaires ({affiliates.length})
            </h2>
          </div>
          <span className="text-xs text-neutral-500">
            Chaque ambassadeur dispose d'un espace de suivi personnel sur <strong>/ambassadeur</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-5">Ambassadeur & Accès</th>
                <th className="py-3 px-4">Lien VIP</th>
                <th className="py-3 px-4">Modèle & Rémunération</th>
                <th className="py-3 px-4 text-center">Trafic & Leads</th>
                <th className="py-3 px-4 text-center">Ventes</th>
                <th className="py-3 px-4">Commissions & Solde</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-neutral-400">
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-neutral-700">Aucun ambassadeur enregistré</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Cliquez sur "Nouvel Ambassadeur" pour créer votre premier compte partenaire avec accès portail.
                    </p>
                  </td>
                </tr>
              ) : (
                affiliates.map((aff) => {
                  const balance = Math.max(0, aff.commissionEarned - (aff.commissionPaid || 0));

                  const getCompensationLabel = () => {
                    const type = aff.commissionType || 'PERCENTAGE';
                    if (type === 'PERCENTAGE') return `${aff.commissionRate}% / vente`;
                    if (type === 'FIXED_PER_ORDER') return `${aff.fixedPerOrder} MAD / cmd`;
                    if (type === 'PAY_PER_VISIT') return `${aff.payPerVisit} MAD / clic`;
                    if (type === 'PAY_PER_LEAD') return `${aff.payPerLead} MAD / lead`;
                    if (type === 'MONTHLY_RETAINER') return `${formatMAD(aff.monthlyRetainer)} / mois`;
                    if (type === 'HYBRID') return `${aff.commissionRate}% + ${aff.fixedPerOrder} DH`;
                    return `${aff.commissionRate}%`;
                  };

                  return (
                    <tr key={aff.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                            {aff.name}
                            {aff.instagram && (
                              <span className="text-[10px] text-neutral-400 font-normal">@{aff.instagram}</span>
                            )}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            {aff.email ? (
                              <span>Portail : <strong className="text-neutral-700 font-mono">{aff.email}</strong></span>
                            ) : (
                              <span className="text-amber-600">Sans accès portail</span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md w-max text-xs font-mono border border-neutral-200">
                          <span>/vip/{aff.code}</span>
                          <a
                            href={`/vip/${aff.code}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-neutral-500 hover:text-neutral-950"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {getCompensationLabel()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-neutral-900">{aff.visits} clics</span>
                          <span className="text-[10px] text-purple-700 font-medium">{aff.leads || 0} leads</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-neutral-900">{aff.sales}</span>
                          <span className="text-[10px] text-emerald-700 font-medium">{formatMAD(aff.revenueGenerated)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-amber-700 font-bold">Dû : {formatMAD(balance)}</span>
                          <span className="text-[10px] text-neutral-400">
                            Gagné : {formatMAD(aff.commissionEarned)} • Versé : {formatMAD(aff.commissionPaid || 0)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/affiliates/${aff.id}`}
                            className="inline-block px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg shadow-2xs transition-colors"
                          >
                            Gérer
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
