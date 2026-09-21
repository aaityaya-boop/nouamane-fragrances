import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { formatMAD } from '@/lib/products';
import { 
  ShoppingCart, 
  Clock, 
  User, 
  Package, 
  TrendingUp, 
  Radio, 
  ExternalLink,
  Sparkles,
  Zap,
  ShieldCheck,
  Phone
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveCartsPage() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const liveCarts = await prisma.liveCartSession.findMany({
    where: {
      lastActivity: { gte: twentyFourHoursAgo },
      items: { not: '[]' }
    },
    orderBy: { lastActivity: 'desc' },
  });

  const activeCartsCount = liveCarts.length;
  const potentialRevenue = liveCarts.reduce((acc, cart) => acc + cart.totalValue, 0);

  // Top added products in last 24h
  const productCounts: Record<string, { name: string, image: string, count: number, totalValue: number }> = {};
  
  liveCarts.forEach(cart => {
    try {
      const items = JSON.parse(cart.items);
      items.forEach((item: any) => {
        if (!productCounts[item.id]) {
          productCounts[item.id] = { name: item.name, image: item.image, count: 0, totalValue: 0 };
        }
        productCounts[item.id].count += (item.quantity || 1);
        productCounts[item.id].totalValue += (item.price || 0) * (item.quantity || 1);
      });
    } catch (e) {
      // ignore
    }
  });

  const topProducts = Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const formatTimeAgo = (date: Date) => {
    const diffInMinutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    const hours = Math.floor(diffInMinutes / 60);
    return `Il y a ${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Radio size={20} className="text-neutral-700" />
            Radar en Temps Réel : Paniers & Sessions d'Achat
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Surveillez les intentions d'achat en direct et les ajouts au panier des 24 dernières heures sur la boutique.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium self-start sm:self-auto shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Radar Live Actif</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 border border-neutral-200">
            <ShoppingCart size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Paniers Actifs (24h)</p>
            <p className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">{activeCartsCount}</p>
            <p className="text-xs text-neutral-500 mt-0.5">Sessions avec articles non validés</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Chiffre d'Affaires Potentiel</p>
            <p className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">{formatMAD(potentialRevenue)}</p>
            <p className="text-xs text-neutral-500 mt-0.5">Valeur cumulée des sélections</p>
          </div>
        </div>
      </div>

      {/* Main Split: Left Activity Feed | Right Top Products Added */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Activity Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 flex items-center gap-2">
              <Zap size={14} className="text-neutral-500" /> Flux des Sélections en Direct
            </h3>
            <span className="text-xs text-neutral-500 font-medium">{liveCarts.length} session(s)</span>
          </div>

          {liveCarts.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 shadow-2xs">
              <ShoppingCart className="mx-auto text-neutral-300 mb-2" size={28} />
              <p className="font-semibold text-neutral-800 text-sm">Aucun panier actif dans les 24 dernières heures.</p>
              <p className="text-xs text-neutral-400 mt-1">Les nouveaux ajouts au panier s'afficheront ici en temps réel.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveCarts.map((cart) => {
                let items: any[] = [];
                try { items = JSON.parse(cart.items); } catch(e){}

                return (
                  <div key={cart.id} className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-2xs hover:border-neutral-300 transition-all space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center text-xs font-semibold border border-neutral-200">
                          <User size={13} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-neutral-900">
                              {cart.customerId ? 'Client Enregistré' : 'Visiteur Boutique'}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              #{cart.sessionId.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Clock size={12} className="text-neutral-400" />
                        <span>{formatTimeAgo(cart.lastActivity)}</span>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-50 border border-neutral-200">
                          <div className="w-9 h-9 rounded-md bg-white overflow-hidden border border-neutral-200 shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={14} className="text-neutral-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-neutral-900 truncate">{item.name}</p>
                            <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-0.5">
                              <span>Qté: {item.quantity || 1}</span>
                              <span className="font-semibold text-neutral-900">{formatMAD((item.price || 0) * (item.quantity || 1))}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                      <span className="text-neutral-500 text-[11px]">Total de la sélection</span>
                      <span className="text-sm font-bold text-neutral-900">{formatMAD(cart.totalValue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Top Products (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-2xs space-y-3 sticky top-20">
            <h3 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-neutral-500" />
              Parfums les plus ajoutés (24h)
            </h3>

            {topProducts.length === 0 ? (
              <p className="text-xs text-neutral-400">Aucune donnée disponible pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((prod, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="w-4 text-center font-bold text-xs text-neutral-400">#{idx + 1}</span>
                    <div className="w-8 h-8 rounded-md bg-white overflow-hidden border border-neutral-200 shrink-0 flex items-center justify-center">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={14} className="text-neutral-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-900 truncate">{prod.name}</p>
                      <p className="text-[11px] text-neutral-500">{prod.count} fois dans les paniers</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
