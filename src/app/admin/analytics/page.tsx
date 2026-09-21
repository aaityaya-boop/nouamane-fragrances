import React from 'react';
import prisma from '@/lib/prisma';
import TrafficChart from '../components/TrafficChart';
import WorldMap from '../components/WorldMap';
import FunnelView from '../components/FunnelView';
import { MapPin, Users, Globe, Clock, Smartphone, Monitor, LayoutDashboard, Filter, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // 1. Chart Data
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

  // 2. All Cities Analysis
  const visitorsByCity = await prisma.visitor.groupBy({
    by: ['city', 'country'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    where: { city: { not: null } }
  });

  // 3. Detailed Visitor Log (Last 100 Page Views)
  const recentActivity = await prisma.pageView.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { visitor: true }
  });

  // 4. Funnel Analytics
  const totalVis = await prisma.visitor.count();
  
  const productViewsList = await prisma.pageView.findMany({
    where: { pathname: { contains: '/product/' } },
    select: { visitorId: true },
    distinct: ['visitorId']
  });
  const cartViewsList = await prisma.pageView.findMany({
    where: { pathname: { contains: '/cart' } },
    select: { visitorId: true },
    distinct: ['visitorId']
  });
  const checkoutViewsList = await prisma.pageView.findMany({
    where: { pathname: { contains: '/checkout' } },
    select: { visitorId: true },
    distinct: ['visitorId']
  });
  const ordersCount = await prisma.order.count();

  const funnelData = [
    { name: 'Visiteurs', value: totalVis },
    { name: 'Vues Produit', value: productViewsList.length },
    { name: 'Ajouts Panier', value: cartViewsList.length },
    { name: 'Checkouts', value: checkoutViewsList.length },
    { name: 'Achats', value: ordersCount }
  ];

  const formatRelativeTime = (date: Date) => {
    const diffInMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
              Statistiques & Trafic
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <TrendingUp size={22} className="text-neutral-900" />
            <span>Audience & Analytics</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Analyse détaillée du trafic, de la localisation géographique et du tunnel d&apos;achat.
          </p>
        </div>

        <Link 
          href="/admin" 
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-xs font-medium text-neutral-800 shadow-2xs cursor-pointer"
        >
          <LayoutDashboard size={14} />
          <span>Retour au Dashboard</span>
        </Link>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Trafic global (7 derniers jours)</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Évolution des visiteurs uniques et du volume de pages consultées.</p>
          </div>
        </div>
        <div className="pt-2">
          <TrafficChart data={chartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* World Map */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
              <Globe size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Carte Géographique des Visiteurs</h2>
              <p className="text-xs text-neutral-500">Origine géographique de votre trafic en ligne</p>
            </div>
          </div>
          <WorldMap data={visitorsByCity} />
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
              <Filter size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Entonnoir de Conversion (Funnel)</h2>
              <p className="text-xs text-neutral-500">Parcours d&apos;achat des visiteurs depuis l&apos;arrivée jusqu&apos;à la commande</p>
            </div>
          </div>
          <FunnelView data={funnelData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cities Table */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-2xs lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
              <MapPin size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Top Villes Visiteurs</h2>
              <p className="text-xs text-neutral-500">Répartition par ville</p>
            </div>
          </div>
          
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {visitorsByCity.length === 0 && (
              <p className="text-neutral-400 text-xs py-8 text-center">Aucune donnée de localisation disponible.</p>
            )}
            {visitorsByCity.map((cityData, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-[#f8fafc] hover:bg-neutral-100/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[11px] font-bold text-neutral-700 border border-neutral-200 shadow-2xs">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-neutral-900">
                      {cityData.city === 'Inconnu' ? 'Ville Inconnue' : cityData.city}
                    </div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Globe size={10} /> {cityData.country}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-neutral-900">{cityData._count.id}</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Visites</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-2xs lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
              <Activity size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Activité en direct</h2>
              <p className="text-xs text-neutral-500">Les 100 dernières actions enregistrées sur le site</p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[480px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                  <th className="py-2.5 px-3">Visiteur</th>
                  <th className="py-2.5 px-3">Page visitée</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3 text-right">Temps</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-neutral-100 text-neutral-700">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-neutral-900">
                        {activity.device === 'Mobile' ? <Smartphone size={13} className="text-neutral-400" /> : <Monitor size={13} className="text-neutral-400" />}
                        <span className="truncate max-w-[130px]">
                          {activity.visitor.city === 'Inconnu' ? 'Inconnu' : activity.visitor.city}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-800 truncate max-w-[200px]" title={activity.pathname}>
                      {activity.pathname}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        activity.referrer === 'Google' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        activity.referrer === 'Instagram' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        activity.referrer === 'Facebook' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        activity.referrer === 'Direct' ? 'bg-neutral-100 text-neutral-700 border-neutral-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {activity.referrer || 'Direct'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-400 text-right text-[11px] whitespace-nowrap">
                      {formatRelativeTime(activity.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
