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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Radio size={22} className="text-emerald-500 animate-pulse" />
            Radar en Temps Réel : Paniers & Sessions d'Achat
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Surveillez les intentions d'achat en direct et les ajouts au panier des 24 dernières heures sur la boutique.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>RADAR LIVE CONNECTÉ</span>
        </div>
      </div>

      {/* Luxury KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Paniers Actifs (24h)</p>
            <p className="text-3xl font-black text-neutral-900 mt-1">{activeCartsCount}</p>
            <p className="text-xs text-neutral-400 mt-0.5">Sessions avec articles non validés</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-2xl p-6 border border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800 text-amber-400 flex items-center justify-center shrink-0 border border-neutral-700">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Chiffre d'Affaires Potentiel</p>
            <p className="text-3xl font-black text-white mt-1">{formatMAD(potentialRevenue)}</p>
            <p className="text-xs text-neutral-400 mt-0.5">Valeur cumulée des sélections</p>
          </div>
        </div>
      </div>

      {/* Main Split: Left Activity Feed | Right Top Products Added */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Activity Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
              <Zap size={15} className="text-amber-500" /> Flux des Sélections en Direct
            </h3>
            <span className="text-xs text-neutral-500">{liveCarts.length} session(s)</span>
          </div>

          {liveCarts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center text-neutral-400">
              <ShoppingCart className="mx-auto text-neutral-300 mb-2" size={32} />
              <p className="font-bold text-neutral-800">Aucun panier actif dans les 24 dernières heures.</p>
              <p className="text-xs text-neutral-400 mt-1">Les nouveaux ajouts au panier s'afficheront ici en temps réel.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveCarts.map((cart) => {
                let items: any[] = [];
                try { items = JSON.parse(cart.items); } catch(e){}

                return (
                  <div key={cart.id} className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center text-xs font-bold">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900">
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
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 border border-neutral-200/60">
                          <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-neutral-200 shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={16} className="text-neutral-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-neutral-900 truncate">{item.name}</p>
                            <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-0.5">
                              <span>Qté: {item.quantity || 1}</span>
                              <span className="font-bold text-neutral-900">{formatMAD((item.price || 0) * (item.quantity || 1))}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                      <span className="text-neutral-500 font-medium">Total de la sélection</span>
                      <span className="text-base font-black text-neutral-900">{formatMAD(cart.totalValue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Top Products (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4 sticky top-20">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Parfums les plus ajoutés (24h)
            </h3>

            {topProducts.length === 0 ? (
              <p className="text-xs text-neutral-400">Aucune donnée disponible pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((prod, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="w-5 text-center font-black text-xs text-amber-600">#{idx + 1}</span>
                    <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-neutral-200 shrink-0 flex items-center justify-center">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} className="text-neutral-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-neutral-900 truncate">{prod.name}</p>
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
