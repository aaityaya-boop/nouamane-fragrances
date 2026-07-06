import React from 'react';
import { Package, TrendingUp, Users, DollarSign, Activity, MapPin, MousePointerClick } from 'lucide-react';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const products = await prisma.product.count();

  // Metrics calculation
  const totalRevenue = orders.filter(o => o.status !== 'annule').reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Unique customers
  const uniqueEmails = new Set(orders.map(o => o.customerEmail));
  const totalCustomers = uniqueEmails.size;

  const pendingOrders = orders.filter(o => o.status === 'en-attente').length;

  // Analytics : Visiteurs
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const activeVisitorsCount = await prisma.visitor.count({
    where: { lastSeen: { gte: fiveMinutesAgo } }
  });

  const todayVisitorsCount = await prisma.visitor.count({
    where: { lastSeen: { gte: startOfDay } }
  });

  const recentPageViews = await prisma.pageView.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { visitor: true }
  });

  // Get Top Cities
  const visitorsByCity = await prisma.visitor.groupBy({
    by: ['city', 'country'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
    where: { city: { not: null } }
  });

  // Format currency
  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-font text-3xl font-medium text-[#1A1A1A] mb-2">Tableau de Bord</h1>
          <p className="text-[14px] text-[#6B6B6B]">Bienvenue sur votre espace d'administration.</p>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          icon={<Activity size={20} className="text-sky-600 animate-pulse" />}
          label="Visiteurs En ligne"
          value={activeVisitorsCount.toString()}
          subtitle="Dernières 5 min"
        />
        <StatCard 
          icon={<Users size={20} className="text-indigo-600" />}
          label="Trafic Aujourd'hui"
          value={todayVisitorsCount.toString()}
          subtitle="Visiteurs uniques"
        />
        <StatCard 
          icon={<DollarSign size={20} className="text-green-600" />}
          label="Chiffre d'affaires"
          value={formatMAD(totalRevenue)}
        />
        <StatCard 
          icon={<Package size={20} className="text-blue-600" />}
          label="Total Commandes"
          value={totalOrders.toString()}
          subtitle={`${pendingOrders} en attente`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Trafic en Temps Réel */}
        <div className="bg-white border border-[#e0ddd4] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-[16px] font-semibold text-[#1A1A1A] flex items-center gap-2">
              <MousePointerClick size={18} className="text-sky-600" /> 
              Activité Récente (Live)
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPageViews.length === 0 ? (
              <p className="p-6 text-gray-500 text-[13px]">Aucune activité récente.</p>
            ) : (
              recentPageViews.map(view => (
                <div key={view.id} className="p-4 hover:bg-[#fafaf7] flex items-center justify-between transition-colors">
                  <div>
                    <p className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1">{view.pathname}</p>
                    <p className="text-[12px] text-[#6B6B6B]">{view.visitor.city}, {view.visitor.country}</p>
                  </div>
                  <div className="text-[12px] text-[#9A9A9A]">
                    {new Date(view.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Villes */}
        <div className="bg-white border border-[#e0ddd4] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-[16px] font-semibold text-[#1A1A1A] flex items-center gap-2">
              <MapPin size={18} className="text-indigo-600" /> 
              Top Villes de Provenance
            </h2>
          </div>
          <div className="divide-y divide-gray-100 p-4">
            {visitorsByCity.length === 0 ? (
              <p className="p-4 text-gray-500 text-[13px]">Pas encore assez de données de trafic.</p>
            ) : (
              visitorsByCity.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-[#9A9A9A]">#{i + 1}</span>
                    <p className="text-[14px] font-medium text-[#1A1A1A]">{v.city === 'Localhost' ? 'Local' : v.city} <span className="text-[#9A9A9A] font-normal">({v.country})</span></p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 py-1 px-3 rounded-full text-[12px] font-bold">
                    {v._count.id} vis.
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-[#e0ddd4] rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-semibold text-[#1A1A1A]">Dernières Commandes</h2>
            <Link href="/admin/orders" className="text-[13px] font-medium text-[#0ea5e9] hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-[#e0ddd4] rounded-xl hover:bg-[#fafaf7] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f4f4f0] flex items-center justify-center">
                    <Package size={16} className="text-[#6B6B6B]" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#1A1A1A]">{order.customerName}</div>
                    <div className="text-[12px] text-[#9A9A9A]">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-semibold text-[#0ea5e9]">{formatMAD(order.total)}</div>
                  <div className="text-[11px] font-medium uppercase mt-1">
                    {order.status === 'en-attente' && <span className="text-orange-500">En attente</span>}
                    {order.status === 'expedie' && <span className="text-blue-500">Expédié</span>}
                    {order.status === 'livre' && <span className="text-green-500">Livré</span>}
                    {order.status === 'annule' && <span className="text-red-500">Annulé</span>}
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center text-[#9A9A9A] py-8 text-[14px]">Aucune commande récente.</div>
            )}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white border border-[#e0ddd4] rounded-2xl shadow-sm p-6">
          <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-6">Résumé Boutique</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Package size={18} /></div>
                <span className="text-[14px] font-medium text-[#1A1A1A]">Produits catalogués</span>
              </div>
              <span className="text-[14px] font-bold text-[#1A1A1A]">{products}</span>
            </div>
            
            <Link 
              href="/admin/products"
              className="block w-full text-center py-3 px-4 bg-[#fafaf7] hover:bg-[#f0f0ed] transition-colors border border-[#e0ddd4] rounded-xl text-[13px] font-semibold text-[#1A1A1A]"
            >
              Gérer les produits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white border border-[#e0ddd4] rounded-2xl shadow-sm p-6 relative overflow-hidden group">
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="w-12 h-12 rounded-full bg-[#fafaf7] flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#9A9A9A]">{label}</div>
        </div>
      </div>
      <div className="text-3xl font-bold text-[#1A1A1A] relative z-10 tracking-tight">{value}</div>
      {subtitle && <div className="text-[12px] text-[#6B6B6B] mt-2 relative z-10">{subtitle}</div>}
    </div>
  );
}
