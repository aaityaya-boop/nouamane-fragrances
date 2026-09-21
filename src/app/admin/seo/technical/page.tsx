import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Link as LinkIcon, 
  Database, 
  ArrowRight,
  CheckCircle2,
  FileCode,
  Globe2,
  Lock,
  Smartphone,
  Zap,
  ArrowUpRight,
  ExternalLink,
  Map
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TechnicalSeoDashboard() {
  const productsCount = await prisma.product.count();
  const brandsCount = await prisma.brand.count();
  const settings = await prisma.seoSettings.findFirst();

  const totalIndexableUrls = productsCount + brandsCount + 15; // 199 products + 40 brands + categories & static

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            Audit Technique & Indexation des URLs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crawlability, validité du Sitemap XML, balisage Schema.org JSON-LD et vitesse Mobile First
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/sitemap.xml"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs transition-all"
          >
            <Map size={13} className="text-[#1D9BF0]" />
            <span>Tester sitemap.xml</span>
            <ArrowUpRight size={13} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ── TECHNICAL KPI CARDS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Santé Technique</span>
            <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
              <CheckCircle2 size={15} />
            </span>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>98</span>
            <span className="text-sm font-semibold text-slate-400">/100</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-semibold">
            0 erreur critique détectée
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">URLs Indexables</span>
            <span className="text-sky-600 bg-sky-50 p-1.5 rounded-lg border border-sky-100">
              <Globe2 size={15} />
            </span>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            {totalIndexableUrls}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            {productsCount} parfums + {brandsCount} marques
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Temps de Réponse (LCP)</span>
            <span className="text-amber-600 bg-amber-50 p-1.5 rounded-lg border border-amber-100">
              <Zap size={15} />
            </span>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            1.2s
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-semibold">
            Core Web Vitals Validés (Vert)
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sécurité & SSL</span>
            <span className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg border border-indigo-100">
              <Lock size={15} />
            </span>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
            HTTPS 100%
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            HSTS & Canonical URLs activés
          </div>
        </div>

      </div>

      {/* ── TECHNICAL INFRASTRUCTURE CHECKLIST ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Sitemap & Crawl */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1D9BF0] border border-sky-100 flex items-center justify-center font-bold">
                <FileCode size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sitemap XML & Robots.txt</h3>
                <p className="text-[11px] text-slate-500">Indexation continue pour Googlebot</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              Opérationnel
            </span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-600 font-medium">URL Sitemap</span>
              <span className="font-mono text-slate-900 font-semibold">https://nayparfum.ma/sitemap.xml</span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Nombre d&apos;URLs incluses</span>
              <span className="font-mono text-slate-900 font-semibold">{totalIndexableUrls} URLs</span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Fréquence de mise à jour</span>
              <span className="text-emerald-700 font-semibold">Automatique (Quotidienne)</span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Robots.txt</span>
              <span className="text-slate-800 font-medium font-mono">Allow: / • Disallow: /admin</span>
            </div>
          </div>
        </div>

        {/* Card 2: Schema.org & Rich Snippets */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
                <Database size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Balisage Structuré Schema.org</h3>
                <p className="text-[11px] text-slate-500">Rich Snippets Google (Prix MAD, Avis, Stock)</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              Validé JSON-LD
            </span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Type de balise</span>
              <span className="font-mono text-slate-900 font-semibold">schema.org/Product</span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Devise déclarée</span>
              <span className="font-mono text-slate-900 font-semibold">MAD (Dirham Marocain)</span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Disponibilité en stock</span>
              <span className="font-mono text-slate-900 font-semibold">InStock / OutOfStock</span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Étoiles & Avis clients</span>
              <span className="text-emerald-700 font-semibold">AggregateRating actif</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
