import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Repeat, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Crown, 
  Sparkles, 
  PieChart, 
  ArrowUpRight, 
  Target,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { formatMAD } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function MarketingAnalyticsPage() {
  const [allCustomers, deliveredOrders, abandonedCarts, campaigns] = await Promise.all([
    prisma.customer.findMany({
      include: { 
        orders: { where: { status: 'delivered' } } 
      }
    }),
    prisma.order.findMany({
      where: { status: 'delivered' },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.abandonedCart.findMany(),
    prisma.marketingCampaign.findMany()
  ]);

  let totalRevenue = 0;
  let firstOrderRevenue = 0;
  let repeatRevenue = 0;
  let returningCustomerCount = 0;
  let singleBuyerCount = 0;

  // Cohorts
  let cohort1 = 0; // 1 order
  let cohort2 = 0; // 2 orders
  let cohort3to5 = 0; // 3-5 orders
  let cohort5plus = 0; // 5+ orders

  allCustomers.forEach(c => {
    const orders = c.orders;
    const count = orders.length;
    const spent = orders.reduce((sum, o) => sum + o.total, 0);
    totalRevenue += spent;

    if (count === 1) {
      singleBuyerCount++;
      cohort1++;
      firstOrderRevenue += spent;
    } else if (count === 2) {
      returningCustomerCount++;
      cohort2++;
      repeatRevenue += spent;
    } else if (count >= 3 && count <= 5) {
      returningCustomerCount++;
      cohort3to5++;
      repeatRevenue += spent;
    } else if (count > 5) {
      returningCustomerCount++;
      cohort5plus++;
      repeatRevenue += spent;
    }
  });

  const totalDelivered = deliveredOrders.length;
  const aov = totalDelivered > 0 ? Math.round(totalRevenue / totalDelivered) : 0;
  const cltv = allCustomers.length > 0 ? Math.round(totalRevenue / allCustomers.length) : 0;
  const repeatRate = allCustomers.length > 0 ? ((returningCustomerCount / allCustomers.length) * 100).toFixed(1) : '0';
  const repeatRevShare = totalRevenue > 0 ? ((repeatRevenue / totalRevenue) * 100).toFixed(1) : '0';

  const abandonedValue = abandonedCarts
    .filter(c => c.status === 'ABANDONED')
    .reduce((sum, c) => sum + c.cartValue, 0);

  const recoveredValue = abandonedCarts
    .filter(c => c.status === 'RECOVERED')
    .reduce((sum, c) => sum + c.cartValue, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={22} className="text-[#0ea5e9]" />
            Cockpit Analytique & Attribution du Chiffre d'Affaires
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Analyse approfondie de la fidélité client, de la récurrence et du retour sur investissement de vos campagnes.
          </p>
        </div>

        <Link
          href="/admin/marketing/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A0A0A] text-[#0ea5e9] hover:bg-[#161616] font-bold text-xs shadow-sm transition-all border border-white/10"
        >
          <Sparkles size={14} />
          <span>Lancer une Campagne Ciblée</span>
        </Link>
      </div>

      {/* Executive Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Chiffre d'Affaires Récurrent</span>
            <div className="p-2 rounded-xl bg-sky-50 text-[#0ea5e9]">
              <Repeat size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{formatMAD(repeatRevenue)}</div>
          <p className="text-xs text-sky-700 font-bold mt-1">{repeatRevShare}% du CA total réalisé par les clients fidèles</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Taux de Rétention</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700">{repeatRate}%</div>
          <p className="text-xs text-neutral-500 mt-1">{returningCustomerCount} clients avec &gt;1 commande</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Valeur Vie Client (LTV)</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900">{formatMAD(cltv)}</div>
          <p className="text-xs text-neutral-500 mt-1">Dépense moyenne par client</p>
        </div>

        <div className="bg-[#0A0A0A] text-white rounded-2xl p-5 border border-[#1e1e1e] shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0ea5e9] uppercase tracking-wider">Potentiel Paniers Abandonnés</span>
            <div className="p-2 rounded-xl bg-[#1c1c1c] text-[#0ea5e9]">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{formatMAD(abandonedValue)}</div>
          <p className="text-xs text-gray-400 mt-1">À convertir via WhatsApp</p>
        </div>
      </div>

      {/* Cohorts & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Customer Loyalty Distribution (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Pyramide de Fidélisation & Fréquence d'Achat</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Répartition de votre base de données selon le nombre de commandes livrées.</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700">
              {allCustomers.length} clients analysés
            </span>
          </div>

          <div className="space-y-4">
            {/* Cohort 1: 1 Order */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">1ère Commande Validée (Découverte)</span>
                <span className="text-neutral-500 font-semibold">{cohort1} clients ({allCustomers.length > 0 ? Math.round((cohort1/allCustomers.length)*100) : 0}%)</span>
              </div>
              <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neutral-400 rounded-full transition-all"
                  style={{ width: `${allCustomers.length > 0 ? (cohort1 / allCustomers.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Cohort 2: 2 Orders */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">2 Commandes (Clients Confirmés)</span>
                <span className="text-neutral-500 font-semibold">{cohort2} clients ({allCustomers.length > 0 ? Math.round((cohort2/allCustomers.length)*100) : 0}%)</span>
              </div>
              <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-400 rounded-full transition-all"
                  style={{ width: `${allCustomers.length > 0 ? (cohort2 / allCustomers.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Cohort 3: 3-5 Orders */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">3 à 5 Commandes (Clients VIP Privilège)</span>
                <span className="text-neutral-500 font-semibold">{cohort3to5} clients ({allCustomers.length > 0 ? Math.round((cohort3to5/allCustomers.length)*100) : 0}%)</span>
              </div>
              <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0ea5e9] rounded-full transition-all"
                  style={{ width: `${allCustomers.length > 0 ? (cohort3to5 / allCustomers.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Cohort 4: >5 Orders */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">Plus de 5 Commandes (Ambassadeurs Diamant)</span>
                <span className="text-neutral-500 font-semibold">{cohort5plus} clients ({allCustomers.length > 0 ? Math.round((cohort5plus/allCustomers.length)*100) : 0}%)</span>
              </div>
              <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-700 rounded-full transition-all"
                  style={{ width: `${allCustomers.length > 0 ? (cohort5plus / allCustomers.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between text-xs">
            <span className="text-neutral-600">
              💡 <b>Stratégie recommandée :</b> Convertir les clients à 1 commande vers leur 2ème commande génère un bond de LTV de +140%.
            </span>
            <Link 
              href="/admin/marketing/campaigns/new?audience=ALL" 
              className="font-bold text-[#0ea5e9] hover:underline shrink-0 ml-4"
            >
              Créer offre 2ème achat →
            </Link>
          </div>
        </div>

        {/* Right: Revenue Breakdown (1 Col) */}
        <div className="bg-[#0A0A0A] text-white rounded-2xl p-6 border border-[#1e1e1e] shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-2 border-b border-[#1e1e1e] pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0ea5e9]">Structure du CA</span>
            <h3 className="font-bold text-white text-base">Impact de la Rétention</h3>
            <p className="text-xs text-gray-400">Comparatif direct Premier Achat vs Réachat.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222]">
              <div className="text-xs text-gray-400">Premières Acquisitions</div>
              <div className="text-xl font-bold text-white mt-1">{formatMAD(firstOrderRevenue)}</div>
              <div className="text-[11px] text-gray-500 mt-1">Nouveaux clients découvrant NAY</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/30">
              <div className="text-xs text-[#0ea5e9] font-bold">Chiffre d'Affaires Fidélisé</div>
              <div className="text-xl font-black text-[#0ea5e9] mt-1">{formatMAD(repeatRevenue)}</div>
              <div className="text-[11px] text-gray-300 mt-1">Commandes répétées à haute marge</div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/admin/marketing/vip"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all active:scale-95"
            >
              <span>Accéder aux Membres VIP</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
