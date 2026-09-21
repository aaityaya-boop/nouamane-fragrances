import React from 'react';
import { Package, TrendingUp, Users, DollarSign, Activity, MapPin, MousePointerClick, ArrowRight, ArrowUpRight, LineChart, Link as LinkIcon, Smartphone, Monitor } from 'lucide-react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import TrafficChart from './components/TrafficChart';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const products = await prisma.product.count();

  // Metrics calculation
  const totalRevenue = orders.filter(o => o.status !== 'annule' && o.status !== 'refused' && o.status !== 'returned').reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Unique customers
  const uniqueEmails = new Set(orders.map(o => o.customerEmail));
  const totalCustomers = uniqueEmails.size;

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'unconfirmed' || o.status === 'en-attente').length;

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
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount);
  };

  // 7-Day Chart Data
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pageViews7Days = await prisma.pageView.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, visitorId: true }
  });

  const chartDataMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
    chartDataMap.set(dateStr, { name: dateStr, views: 0, visitors: new Set() });
  }

  pageViews7Days.forEach((pv: any) => {
    const dateStr = pv.createdAt.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
    if (chartDataMap.has(dateStr)) {
      const data = chartDataMap.get(dateStr);
      data.views += 1;
      data.visitors.add(pv.visitorId);
    }
  });

  const chartData = Array.from(chartDataMap.values()).map(d => ({
    name: d.name,
    Vues: d.views,
    Visiteurs: d.visitors.size
  }));

  // Top Referrers
  const topReferrers = await prisma.pageView.groupBy({
    by: ['referrer'],
    _count: { id: true },
    where: { createdAt: { gte: sevenDaysAgo }, referrer: { not: null } },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  });

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto text-neutral-900 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Tableau de bord</h1>
          <p className="text-[13px] text-neutral-500 mt-1">Aperçu en temps réel de l&apos;activité de la maison NAY.</p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/admin/products" className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors">
            Gérer les produits
          </Link>
          <Link href="/" target="_blank" className="bg-neutral-900 hover:bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
            Boutique en ligne <ArrowUpRight size={14} className="text-neutral-400" />
          </Link>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<DollarSign size={18} className="text-neutral-900" />}
          label="Chiffre d'affaires"
          value={formatMAD(totalRevenue)}
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          icon={<Package size={18} className="text-neutral-900" />}
          label="Total Commandes"
          value={totalOrders.toString()}
          subtitle={`${pendingOrders} en attente`}
        />
        <StatCard 
          icon={<Users size={18} className="text-neutral-900" />}
          label="Visiteurs Aujourd'hui"
          value={todayVisitorsCount.toString()}
          trend="+5%"
          trendUp={true}
        />
        <StatCard 
          icon={<Activity size={18} className="text-neutral-900" />}
          label="En Ligne (Live)"
          value={activeVisitorsCount.toString()}
          pulsing={true}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Column (Orders & Traffic) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Recent Orders Table */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-neutral-900">Dernières Commandes</h2>
              <Link href="/admin/orders" className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1">
                Toutes les commandes <ArrowRight size={13} />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Montant</th>
                    <th className="px-5 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-neutral-900">{order.customerName}</div>
                        <div className="text-[11px] text-neutral-400">{order.orderNumber}</div>
                      </td>
                      <td className="px-5 py-3 text-neutral-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('fr-MA', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-5 py-3 font-semibold text-neutral-900">
                        {formatMAD(order.total)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border bg-neutral-100 text-neutral-700 border-neutral-200">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-neutral-400">
                        Aucune commande enregistrée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7 Days Chart Section */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-2xs">
            <h2 className="text-[13px] font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <LineChart size={15} />
              Trafic & Visiteurs (7 derniers jours)
            </h2>
            <TrafficChart data={chartData} />
          </div>
        </div>

        {/* Side Column (Live Activity & Referrers) */}
        <div className="space-y-6">
          {/* Live Activity Feed */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-[13px] font-bold text-neutral-900 flex items-center gap-2">
                <MousePointerClick size={15} /> 
                Activité en direct
              </h2>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="divide-y divide-neutral-100">
              {recentPageViews.length === 0 ? (
                <p className="px-5 py-8 text-neutral-400 text-center text-xs">Aucune activité récente.</p>
              ) : (
                recentPageViews.map((view: any) => (
                  <div key={view.id} className="p-3.5 hover:bg-neutral-50/70 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-neutral-900 truncate">{view.pathname}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                        {view.visitor?.city || 'Maroc'} • {view.referrer || 'Direct'}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                      {new Date(view.createdAt).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Sources */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs">
            <h2 className="text-[13px] font-bold text-neutral-900 mb-3">Sources de trafic</h2>
            <div className="space-y-2 text-xs">
              {topReferrers.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-neutral-100 last:border-0">
                  <span className="text-neutral-700 font-medium truncate max-w-[180px]">{r.referrer || 'Accès direct'}</span>
                  <span className="font-mono text-neutral-500 font-semibold">{r._count.id} vues</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  pulsing?: boolean;
}

function StatCard({ icon, label, value, subtitle, trend, trendUp, pulsing }: StatCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">{label}</span>
        {trend && (
          <span className={`text-[11px] font-mono font-semibold ${trendUp ? 'text-emerald-700' : 'text-rose-700'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-neutral-900 tracking-tight">{value}</div>
      {subtitle && <div className="text-[11px] text-neutral-400 mt-1">{subtitle}</div>}
    </div>
  );
}
