import React from 'react';
import prisma from '@/lib/prisma';
import { formatMAD } from '@/lib/products';
import { ShoppingCart, Clock, User, Package, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveCartsPage() {
  // Fetch carts active in the last 24 hours that are NOT empty
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

  // Calculate most added products
  const productCounts: Record<string, { name: string, image: string, count: number }> = {};
  
  liveCarts.forEach(cart => {
    try {
      const items = JSON.parse(cart.items);
      items.forEach((item: any) => {
        if (!productCounts[item.id]) {
          productCounts[item.id] = { name: item.name, image: item.image, count: 0 };
        }
        productCounts[item.id].count += item.quantity;
      });
    } catch (e) {
      // ignore JSON parse errors
    }
  });

  const topProducts = Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const formatTimeAgo = (date: Date) => {
    const diffInMinutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    const hours = Math.floor(diffInMinutes / 60);
    return `Il y a ${hours}h`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Paniers en direct</h1>
          <p className="text-[#6B6B6B] mt-2">Surveillez les ajouts au panier en temps réel (24h dernières heures).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-full">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Paniers Actifs</p>
            <p className="text-2xl font-bold text-gray-900">{activeCartsCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 flex items-center justify-center rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Chiffre d'Affaires Potentiel</p>
            <p className="text-2xl font-bold text-gray-900">{formatMAD(potentialRevenue)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ActivityIcon /> Flux d'Activité
          </h2>
          
          {liveCarts.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
              Aucun panier actif dans les dernières 24 heures.
            </div>
          ) : (
            <div className="space-y-4">
              {liveCarts.map((cart) => {
                let items: any[] = [];
                try { items = JSON.parse(cart.items); } catch(e){}
                
                return (
                  <div key={cart.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <User size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {cart.customerId ? 'Client Connecté' : 'Visiteur Anonyme'}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">ID: {cart.sessionId.substring(0,8)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Clock size={14} />
                        {formatTimeAgo(cart.lastActivity)}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 rounded flex-shrink-0 overflow-hidden relative">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 m-3 text-gray-400" />
                            )}
                            <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex 
items-center justify-center rounded-full font-bold">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.size}</p>
                          </div>
                          <div className="font-semibold text-sm text-gray-900">
                            {formatMAD(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total du panier</span>
                      <span className="text-lg font-bold text-gray-900">{formatMAD(cart.totalValue)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Produits les plus ajoutés (24h)</h2>
            
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-500">Pas de données.</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-gray-400 font-bold w-4">{idx + 1}</span>
                    <div className="w-10 h-10 bg-gray-50 rounded overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 m-2.5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.count} dans les paniers</p>
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

function ActivityIcon() {
  return (
    <div className="relative flex h-3 w-3 mr-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
    </div>
  )
}
