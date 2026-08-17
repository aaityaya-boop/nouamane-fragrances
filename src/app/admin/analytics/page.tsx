import React from 'react';
import prisma from '@/lib/prisma';
import TrafficChart from '../components/TrafficChart';
import { MapPin, Users, Globe, Clock, Smartphone, Monitor, LayoutDashboard } from 'lucide-react';
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

  const formatRelativeTime = (date: Date) => {
    const diffInMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Audience & Analytics</h1>
          <p className="text-[#6B6B6B] mt-1">Analyse détaillée du trafic et de la localisation des clients</p>
        </div>
        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e0ddd4] rounded-xl hover:bg-[#fafaf7] transition-colors text-[14px] font-medium">
          <LayoutDashboard size={18} />
          Retour au Dashboard
        </Link>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-3xl p-8 border border-[#e0ddd4] shadow-sm mb-8">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Trafic (7 derniers jours)</h2>
        <p className="text-[14px] text-[#6B6B6B] mb-6">Évolution des visiteurs uniques et des pages vues.</p>
        <TrafficChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cities Table */}
        <div className="bg-white rounded-3xl p-8 border border-[#e0ddd4] shadow-sm lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Emplacement (Villes)</h2>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {visitorsByCity.length === 0 && (
              <p className="text-[#6B6B6B] text-[14px]">Aucune donnée de localisation disponible.</p>
            )}
            {visitorsByCity.map((cityData, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-[#e0ddd4]/50 hover:bg-[#fafaf7] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#fafaf7] rounded-full flex items-center justify-center text-[12px] border border-[#e0ddd4]">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-[14px] text-[#1A1A1A]">
                      {cityData.city === 'Inconnu' ? 'Ville Inconnue' : cityData.city}
                    </div>
                    <div className="text-[12px] text-[#6B6B6B] flex items-center gap-1 mt-0.5">
                      <Globe size={10} /> {cityData.country}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#1A1A1A]">{cityData._count.id}</div>
                  <div className="text-[11px] text-[#6B6B6B] uppercase tracking-wider">Visiteurs</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-3xl p-8 border border-[#e0ddd4] shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Activité en direct</h2>
              <p className="text-[13px] text-[#6B6B6B] mt-0.5">Les 100 dernières actions sur le site</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e0ddd4]">
                  <th className="pb-3 font-semibold text-[#6B6B6B] text-[13px]">Visiteur (Ville)</th>
                  <th className="pb-3 font-semibold text-[#6B6B6B] text-[13px]">Page visitée</th>
                  <th className="pb-3 font-semibold text-[#6B6B6B] text-[13px]">Source</th>
                  <th className="pb-3 font-semibold text-[#6B6B6B] text-[13px]">Temps</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="border-b border-[#e0ddd4]/40 hover:bg-[#fafaf7]">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {activity.device === 'Mobile' ? <Smartphone size={14} className="text-gray-400" /> : <Monitor size={14} className="text-gray-400" />}
                        <span className="font-medium">
                          {activity.visitor.city === 'Inconnu' ? 'Visiteur inconnu' : activity.visitor.city}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-[13px] text-blue-600 truncate max-w-[200px]" title={activity.pathname}>
                      {activity.pathname}
                    </td>
                    <td className="py-4">
                      <span className={`inline-block px-2 py-1 rounded text-[11px] font-medium ${
                        activity.referrer === 'Google' ? 'bg-orange-100 text-orange-700' :
                        activity.referrer === 'Instagram' ? 'bg-pink-100 text-pink-700' :
                        activity.referrer === 'Facebook' ? 'bg-blue-100 text-blue-700' :
                        activity.referrer === 'Direct' ? 'bg-gray-100 text-gray-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {activity.referrer || 'Direct'}
                      </span>
                    </td>
                    <td className="py-4 text-[#6B6B6B] flex items-center gap-1.5">
                      <Clock size={12} />
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
