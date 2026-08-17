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
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111] mb-2 tracking-tight">Vue d'ensemble</h1>
          <p className="text-[14px] text-[#666]">L'activité de votre boutique en temps réel.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products" className="bg-white border border-[#eaeaea] hover:border-[#ccc] hover:bg-gray-50 text-[#111] px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all shadow-sm">
            Ajouter un produit
          </Link>
          <Link href="/" target="_blank" className="bg-[#111] text-white px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#333] transition-all shadow-md flex items-center gap-2">
            Voir le site <ArrowUpRight size={16} className="text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<DollarSign size={20} className="text-emerald-500" />}
          label="Chiffre d'affaires"
          value={formatMAD(totalRevenue)}
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          icon={<Package size={20} className="text-[#0ea5e9]" />}
          label="Total Commandes"
          value={totalOrders.toString()}
          subtitle={`${pendingOrders} en attente`}
        />
        <StatCard 
          icon={<Users size={20} className="text-indigo-500" />}
          label="Visiteurs Aujourd'hui"
          value={todayVisitorsCount.toString()}
          trend="+5%"
          trendUp={true}
        />
        <StatCard 
          icon={<Activity size={20} className="text-amber-500" />}
          label="En Ligne (Live)"
          value={activeVisitorsCount.toString()}
          pulsing={true}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Column (Orders & Traffic) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Recent Orders Table */}
          <div className="bg-white border border-[#eaeaea] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#eaeaea] flex items-center justify-between bg-white">
              <h2 className="text-[15px] font-bold text-[#111] tracking-tight">Dernières Commandes</h2>
              <Link href="/admin/orders" className="text-[13px] font-medium text-[#0ea5e9] hover:text-blue-600 flex items-center gap-1 group transition-colors">
                Toutes les commandes <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeaea]">
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-[#fafafa] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-[12px] font-bold text-gray-600 shadow-sm border border-white">
                            {order.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-[13px] font-medium text-[#111]">{order.customerName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#666]">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-[#111]">
                        {formatMAD(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'en-attente' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-500/20">En attente</span>}
                        {order.status === 'expedie' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-500/20">Expédié</span>}
                        {order.status === 'livre' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-500/20">Livré</span>}
                        {order.status === 'annule' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-600 ring-1 ring-inset ring-red-500/20">Annulé</span>}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[#666] text-[13px]">
                        Aucune commande enregistrée pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* Side Column (Traffic Details) */}
        <div className="space-y-8">
          
          {/* Live Activity Feed */}
          <div className="bg-white border border-[#eaeaea] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#eaeaea] bg-white flex justify-between items-center">
              <h2 className="text-[15px] font-bold text-[#111] flex items-center gap-2 tracking-tight">
                <MousePointerClick size={16} className="text-[#0ea5e9]" /> 
                Activité (Live)
              </h2>
              <div className="flex gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
              </div>
            </div>
            <div className="divide-y divide-[#eaeaea]">
              {recentPageViews.length === 0 ? (
                <p className="px-6 py-8 text-[#666] text-center text-[13px]">Aucune activité récente.</p>
              ) : (
                recentPageViews.map((view: any) => (
                  <div key={view.id} className="p-4 hover:bg-[#fafafa] flex items-center justify-between transition-colors group">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        {view.device === 'Mobile' ? <Smartphone size={12} className="text-emerald-500" /> : <Monitor size={12} className="text-blue-500" />}
                        <p className="text-[13px] font-semibold text-[#111] truncate">{view.pathname}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#666]">
                        <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                          <LinkIcon size={10} /> {view.referrer || 'Direct'}
                        </span>
                        <span className="truncate">{view.visitor.city || 'Inconnu'}, {view.visitor.country || 'Inconnu'}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#888] font-medium whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md border border-gray-100 group-hover:bg-white group-hover:border-gray-200 transition-colors">
                      {new Date(view.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white border border-[#eaeaea] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#eaeaea] bg-white">
              <h2 className="text-[15px] font-bold text-[#111] flex items-center gap-2 tracking-tight">
                <MapPin size={16} className="text-indigo-500" /> 
                Top Villes
              </h2>
            </div>
            <div className="divide-y divide-[#eaeaea] px-4 py-2">
              {visitorsByCity.length === 0 ? (
                <p className="p-4 text-center text-[#666] text-[13px]">Pas encore de données géographiques.</p>
              ) : (
                visitorsByCity.map((v, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-2 group">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-[11px] font-bold text-[#999] group-hover:text-indigo-500 transition-colors">
                        {i + 1}.
                      </span>
                      <p className="text-[13px] font-medium text-[#111]">
                        {v.city === 'Localhost' ? 'Local' : v.city} 
                        <span className="text-[#666] ml-1 font-normal opacity-70">({v.country})</span>
                      </p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-600 py-1 px-2.5 rounded-md text-[11px] font-bold tracking-wide">
                      {v._count.id} vis.
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Sources (Referrers) */}
          <div className="bg-white border border-[#eaeaea] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#eaeaea] bg-white">
              <h2 className="text-[15px] font-bold text-[#111] flex items-center gap-2 tracking-tight">
                <LinkIcon size={16} className="text-emerald-500" /> 
                Sources de Trafic
              </h2>
            </div>
            <div className="divide-y divide-[#eaeaea] px-4 py-2">
              {topReferrers.length === 0 ? (
                <p className="p-4 text-center text-[#666] text-[13px]">Pas encore de sources trackées.</p>
              ) : (
                topReferrers.map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-2 group">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-[11px] font-bold text-[#999] group-hover:text-emerald-500 transition-colors">
                        {i + 1}.
                      </span>
                      <p className="text-[13px] font-medium text-[#111]">
                        {r.referrer}
                      </p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 py-1 px-2.5 rounded-md text-[11px] font-bold tracking-wide">
                      {r._count.id} vues
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 7 Days Chart Section */}
      <div className="mt-8">
        <div className="bg-white border border-[#eaeaea] rounded-2xl shadow-sm overflow-hidden p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[15px] font-bold text-[#111] flex items-center gap-2 tracking-tight">
              <LineChart size={16} className="text-[#0ea5e9]" />
              Trafic (7 Derniers Jours)
            </h2>
          </div>
          <TrafficChart data={chartData} />
        </div>
      </div>
    </div>
  );
}

// --- MICRO-COMPONENTS ---

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
    <div className="bg-white border border-[#eaeaea] rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-[#ddd] hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.08)] transition-all duration-300">
      
      {/* Decorative gradient blur in background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-50 rounded-full blur-2xl opacity-50 group-hover:bg-sky-50 transition-colors duration-500 pointer-events-none"></div>

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-center shadow-sm ${pulsing ? 'animate-pulse' : ''}`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-[12px] font-bold px-2 py-1 rounded-md ${trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
            {trend}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <h3 className="text-[12px] font-semibold text-[#666] mb-1">{label}</h3>
        <div className="text-2xl font-bold text-[#111] tracking-tight">{value}</div>
        {subtitle && <div className="text-[12px] text-[#888] mt-2 font-medium">{subtitle}</div>}
      </div>
    </div>
  );
}
