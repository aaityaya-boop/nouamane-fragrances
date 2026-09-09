'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Radio, 
  Send, 
  PlusCircle, 
  Crown, 
  BarChart3, 
  Sliders, 
  Sparkles,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';

const MARKETING_TABS = [
  { href: '/admin/marketing', label: "Vue d'ensemble", icon: <LayoutDashboard size={16} /> },
  { href: '/admin/marketing/abandoned-carts', label: 'Paniers Abandonnés', icon: <ShoppingCart size={16} /> },
  { href: '/admin/marketing/live-carts', label: 'Paniers en direct', icon: <Radio size={16} />, live: true },
  { href: '/admin/marketing/campaigns', label: 'Campagnes & Messages', icon: <Send size={16} /> },
  { href: '/admin/marketing/campaigns/new', label: 'Nouvelle Campagne', icon: <PlusCircle size={16} /> },
  { href: '/admin/marketing/vip', label: 'Clients VIP & Fidélité', icon: <Crown size={16} /> },
  { href: '/admin/marketing/analytics', label: 'Analytique & ROI', icon: <BarChart3 size={16} /> },
  { href: '/admin/marketing/settings', label: 'Automatisations', icon: <Sliders size={16} /> },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Luxury Command Center Top Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 md:p-8 text-white shadow-xl border border-neutral-800">
        {/* Decorative Gold & Emerald Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-700/60 text-xs font-semibold tracking-wider text-amber-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="uppercase font-mono">RETENTION & MARKETING ENGINE</span>
              <span className="text-neutral-500">•</span>
              <span className="text-emerald-400 font-medium">SYSTÈME LIVE ACTIF</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Centre de Rétention & Croissance
              <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-neutral-400 text-sm md:text-base max-w-2xl font-light">
              Maximisez la Valeur Vie Client (LTV), réactivez les paniers abandonnés sur WhatsApp et pilotez vos campagnes haute performance pour NAY Parfum.
            </p>
          </div>

          {/* Luxury Executive Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/marketing/campaigns/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <PlusCircle size={16} />
              <span>Créer Campagne</span>
            </Link>

            <Link
              href="/admin/marketing/live-carts"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700 text-white font-medium text-sm transition-all hover:border-neutral-600 active:scale-95"
            >
              <Radio size={15} className="text-emerald-400 animate-pulse" />
              <span>Paniers en direct</span>
            </Link>

            <Link
              href="/admin/marketing/abandoned-carts"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-medium text-sm transition-all hover:border-neutral-600 active:scale-95"
            >
              <ShoppingCart size={15} className="text-amber-400" />
              <span>Relances WhatsApp</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Horizontal Executive Navigation Tabs */}
      <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-200/80 shadow-sm p-1.5 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1 min-w-max">
          {MARKETING_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-md shadow-neutral-900/10 scale-[1.02]'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                }`}
              >
                <span className={isActive ? 'text-amber-400' : 'text-neutral-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.live && (
                  <span className="relative flex h-2 w-2 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {children}
      </div>
    </div>
  );
}
