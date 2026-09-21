import React from 'react';
import prisma from '@/lib/prisma';
import { AlertCircle, Search, Key, Globe2, ArrowUpRight, TrendingUp, Sparkles, Filter } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function KeywordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  
  const keywords = await prisma.seoKeyword.findMany({
    where: q ? {
      keyword: { contains: q, mode: 'insensitive' }
    } : undefined,
    orderBy: { impressions: 'desc' },
    take: 50
  });

  const totalVolume = keywords.reduce((acc, k) => acc + k.searchVolume, 0);
  const totalClicks = keywords.reduce((acc, k) => acc + k.clicks, 0);
  const avgPosition = keywords.length > 0 
    ? (keywords.reduce((acc, k) => acc + (k.currentPosition || 3), 0) / keywords.length).toFixed(1) 
    : '2.8';

  return (
    <div className="space-y-6">
      
      {/* ── HEADER & SEARCH ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Key size={16} className="text-[#1D9BF0]" />
            Mots-Clés & Requêtes de Recherche Google Maroc (Google.ma)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des intentions d&apos;achat, volumes mensuels au Maroc et positions dans les résultats Google
          </p>
        </div>
        
        <form className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input 
            type="text" 
            name="q"
            defaultValue={q || ''}
            placeholder="Filtrer les mots-clés (ex: Dior, testeur)..." 
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]/30 focus:border-[#1D9BF0] transition-all w-full md:w-72 shadow-xs"
          />
        </form>
      </div>

      {/* ── KPI MINI-CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Volume Mensuel Capté</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{totalVolume.toLocaleString('fr-MA')} <span className="text-xs font-normal text-slate-400">rech/mois</span></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clics Mensuels Générés</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{totalClicks.toLocaleString('fr-MA')} <span className="text-xs font-normal text-slate-400">visites</span></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Position Moyenne Google.ma</div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-600 mt-1">#{avgPosition}</div>
        </div>
      </div>

      {/* ── KEYWORDS TABLE ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Mot-Clé / Requête</th>
                <th className="px-5 py-3.5">Pays & Langue</th>
                <th className="px-5 py-3.5">Intention d&apos;Achat</th>
                <th className="px-5 py-3.5 text-right">Volume Maroc</th>
                <th className="px-5 py-3.5 text-right">Impressions</th>
                <th className="px-5 py-3.5 text-right">Clics</th>
                <th className="px-5 py-3.5 text-right">Position Google</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keywords.map((kw) => (
                <tr key={kw.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Keyword */}
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Key size={12} className="text-slate-400" />
                      <span>{kw.keyword}</span>
                    </span>
                  </td>

                  {/* Country & Language */}
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      <span>🇲🇦</span>
                      <span>{kw.country || 'MA'}</span>
                    </span>
                  </td>

                  {/* Intent */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      kw.searchIntent === 'TRANSACTIONAL'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                        : kw.searchIntent === 'COMMERCIAL'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200/60'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {kw.searchIntent === 'TRANSACTIONAL' ? 'Transactionnel (Achat)' : kw.searchIntent === 'COMMERCIAL' ? 'Commercial (Comparatif)' : 'Informationnel'}
                    </span>
                  </td>

                  {/* Search volume */}
                  <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-700">
                    {kw.searchVolume.toLocaleString('fr-MA')}/m
                  </td>

                  {/* Impressions */}
                  <td className="px-5 py-3.5 text-right font-mono text-slate-600">
                    {kw.impressions.toLocaleString('fr-MA')}
                  </td>

                  {/* Clicks */}
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600">
                    {kw.clicks.toLocaleString('fr-MA')}
                  </td>

                  {/* Position */}
                  <td className="px-5 py-3.5 text-right">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      #{kw.currentPosition?.toFixed(1) || '3.0'}
                    </span>
                  </td>

                  {/* Link */}
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={kw.url || '/'}
                      target="_blank"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 inline-flex items-center justify-center transition-colors"
                      title="Voir la page cible"
                    >
                      <ArrowUpRight size={14} />
                    </Link>
                  </td>

                </tr>
              ))}

              {keywords.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <AlertCircle size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Aucun mot-clé ne correspond à votre filtre.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
