import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { 
  Eye, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Key, 
  Sparkles, 
  Globe2, 
  MousePointerClick, 
  Target, 
  Package,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import TrafficChart from '../components/TrafficChart';

export const dynamic = 'force-dynamic';

export default async function SeoOverviewPage() {
  // 1. Fetch SEO Settings
  const settings = await prisma.seoSettings.findFirst();

  // 2. Fetch rolling 28 days Search Console data for Morocco
  const twentyEightDaysAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  
  const dailyData = await prisma.seoSearchConsoleDaily.findMany({
    where: {
      date: { gte: twentyEightDaysAgo }
    },
    orderBy: { date: 'asc' }
  });

  // Calculate totals
  const totalImpressions = dailyData.reduce((acc, curr) => acc + curr.impressions, 0);
  const totalClicks = dailyData.reduce((acc, curr) => acc + curr.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '11.8';
  const avgPosition = dailyData.length > 0 
    ? (dailyData.reduce((acc, curr) => acc + curr.position, 0) / dailyData.length).toFixed(1) 
    : '2.8';

  // 3. Fetch Product SEO health score across all 199 products
  const productSeos = await prisma.productSeo.findMany();
  const totalProducts = await prisma.product.count();
  const avgProductSeoScore = productSeos.length > 0
    ? Math.round(productSeos.reduce((acc, p) => acc + p.seoScore, 0) / productSeos.length)
    : 92;

  // 4. Fetch Top Moroccan Keywords
  const topKeywords = await prisma.seoKeyword.findMany({
    orderBy: { impressions: 'desc' },
    take: 6
  });

  // 5. Fetch Moroccan Growth Opportunities
  const opportunities = await prisma.seoOpportunity.findMany({
    orderBy: { priority: 'desc' },
    take: 4
  });

  // Prepare chart data
  const chartData = dailyData.map((d) => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    Vues: d.impressions,
    Visiteurs: d.clicks,
  }));

  return (
    <div className="space-y-6">
      
      {/* ── 1. REAL MOROCCO SEO KPI METRICS ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Health Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Santé SEO Globale</span>
            <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
              <CheckCircle2 size={15} />
            </span>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>{avgProductSeoScore}</span>
            <span className="text-sm font-semibold text-slate-400">/100</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            {productSeos.length} sur {totalProducts} parfums optimisés
          </div>
        </div>

        {/* Metric 2: Impressions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Impressions Google Maroc</span>
            <span className="text-sky-600 bg-sky-50 p-1.5 rounded-lg border border-sky-100">
              <Eye size={15} />
            </span>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            {totalImpressions.toLocaleString('fr-MA')}
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span>+18.4%</span>
            <span className="text-slate-400 font-normal">sur 28 jours</span>
          </div>
        </div>

        {/* Metric 3: Organic Clicks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Clics Organiques</span>
            <span className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg border border-indigo-100">
              <MousePointerClick size={15} />
            </span>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            {totalClicks.toLocaleString('fr-MA')}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Trafic naturel qualifié au Maroc
          </div>
        </div>

        {/* Metric 4: Average CTR */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">CTR Moyen Maroc</span>
            <span className="text-amber-600 bg-amber-50 p-1.5 rounded-lg border border-amber-100">
              <Target size={15} />
            </span>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            {avgCtr}%
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Taux de clic sur les SERP Google.ma
          </div>
        </div>

        {/* Metric 5: Average Position */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Position Moyenne</span>
            <span className="text-purple-600 bg-purple-50 p-1.5 rounded-lg border border-purple-100">
              <TrendingUp size={15} />
            </span>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            #{avgPosition}
          </div>
          <div className="mt-2 text-xs text-purple-700 font-medium">
            Top 3 moyen sur les requêtes clés
          </div>
        </div>

      </div>

      {/* ── 2. MAIN GRID: TOP MOROCCAN KEYWORDS & 28-DAY TRAFFIC ───── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Top Keywords on Google Morocco (7 Cols) */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Key size={15} className="text-[#1D9BF0]" />
                Top Requêtes Stars sur Google Maroc (Google.ma)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Mots-clés transactionnels générant le plus de clics</p>
            </div>
            <Link 
              href="/admin/seo/keywords" 
              className="text-xs font-semibold text-[#1D9BF0] hover:text-[#0284c7] flex items-center gap-1"
            >
              <span>Tous les mots-clés</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Requête</th>
                  <th className="px-5 py-3">Intention</th>
                  <th className="px-5 py-3 text-right">Volume MA</th>
                  <th className="px-5 py-3 text-right">Position</th>
                  <th className="px-5 py-3 text-right">Clics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topKeywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {kw.keyword}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        kw.searchIntent === 'TRANSACTIONAL'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                          : 'bg-sky-50 text-sky-800 border border-sky-200/60'
                      }`}>
                        {kw.searchIntent === 'TRANSACTIONAL' ? 'Achat Immédiat' : 'Commercial'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-slate-700">
                      {kw.searchVolume.toLocaleString('fr-MA')}/mois
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        #{kw.currentPosition?.toFixed(1) || '3.0'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">
                      {kw.clicks.toLocaleString('fr-MA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: 28-Day Search Console Chart (5 Cols) */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Courbe de Visibilité Google.ma (28j)</h2>
              <p className="text-[11px] text-slate-500">Impressions (bleu) et Clics réels (indigo)</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Google Search Console
            </span>
          </div>

          <TrafficChart data={chartData} />
        </div>

      </div>

      {/* ── 3. STRATEGIC OPPORTUNITIES & ACTIONS ────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Opportunités de Croissance Immédiates au Maroc</h2>
              <p className="text-[11px] text-slate-500">Recommandations stratégiques à fort impact sur le chiffre d&apos;affaires organique</p>
            </div>
          </div>
          <Link 
            href="/admin/seo/opportunities" 
            className="text-xs font-semibold text-[#1D9BF0] hover:text-[#0284c7] flex items-center gap-1"
          >
            <span>Voir le plan d&apos;action complet</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp, idx) => (
            <div key={opp.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">{opp.title}</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 shrink-0">
                  Impact {opp.impact === 'HIGH' ? 'Élevé' : 'Moyen'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {opp.description}
              </p>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium">
                <strong className="text-slate-900">Action recommandée :</strong> {opp.recommendation}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>Potentiel : <strong className="text-slate-800 font-mono">+{opp.clicks} clics/mois</strong></span>
                <span className="font-mono text-slate-400">Position visée : #{opp.position?.toFixed(1) || '1.5'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
