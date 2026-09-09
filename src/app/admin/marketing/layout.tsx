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
  MessageCircle,
  Flame
} from 'lucide-react';

const MARKETING_TABS = [
  { href: '/admin/marketing', label: "Vue d'ensemble", icon: <LayoutDashboard size={15} /> },
  { href: '/admin/marketing/abandoned-carts', label: 'Paniers Abandonnés', icon: <ShoppingCart size={15} /> },
  { href: '/admin/marketing/live-carts', label: 'Paniers en direct', icon: <Radio size={15} />, live: true },
  { href: '/admin/marketing/campaigns', label: 'Campagnes & Messages', icon: <Send size={15} /> },
  { href: '/admin/marketing/campaigns/new', label: 'Nouvelle Campagne', icon: <PlusCircle size={15} /> },
  { href: '/admin/marketing/vip', label: 'Clients VIP & Fidélité', icon: <Crown size={15} /> },
  { href: '/admin/marketing/analytics', label: 'Analytique & ROI', icon: <BarChart3 size={15} /> },
  { href: '/admin/marketing/settings', label: 'Automatisations', icon: <Sliders size={15} /> },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Luxury Brand Command Center Top Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] border border-[#1e1e1e] p-6 md:p-8 text-white shadow-2xl">
        {/* Decorative NAY Sapphire & Emerald Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#0ea5e9]/15 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-600/10 blur-[90px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#151515] border border-white/10 text-xs font-semibold tracking-wider text-gray-300">
              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#0ea5e9] to-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm shadow-sky-500/30">
                <Sparkles size={10} />
              </div>
              <span className="uppercase font-mono text-[11px] text-[#0ea5e9] tracking-wider font-bold">NAY RETENTION ENGINE</span>
              <span className="text-gray-600">•</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-medium text-[11px]">HAUTE PERFORMANCE LIVE</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Command Center Rétention & Marketing
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl font-normal leading-relaxed">
              Pilotez la fidélisation de vos clients, convertissez les paniers abandonnés sur WhatsApp et optimisez le revenu récurrent de votre maison de parfum.
            </p>
          </div>

          {/* Luxury Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/marketing/campaigns/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] via-sky-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs tracking-wide shadow-lg shadow-sky-500/25 transition-all duration-200 active:scale-95 border border-sky-400/30"
            >
              <PlusCircle size={16} />
              <span>Nouvelle Campagne</span>
            </Link>

            <Link
              href="/admin/marketing/live-carts"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161616] hover:bg-[#1f1f1f] border border-[#2a2a2a] text-gray-200 hover:text-white font-semibold text-xs transition-all duration-200 active:scale-95"
            >
              <Radio size={14} className="text-[#0ea5e9] animate-pulse" />
              <span>Paniers en direct</span>
            </Link>

            <Link
              href="/admin/marketing/abandoned-carts"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161616] hover:bg-[#1f1f1f] border border-[#2a2a2a] text-gray-200 hover:text-white font-semibold text-xs transition-all duration-200 active:scale-95"
            >
              <ShoppingCart size={14} className="text-emerald-400" />
              <span>Relances WhatsApp</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Horizontal Executive Navigation Tabs */}
      <div className="sticky top-2 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl rounded-2xl border border-[#1e1e1e] shadow-xl p-1.5 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1 min-w-max">
          {MARKETING_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1a1a1a] text-white shadow-md ring-1 ring-white/10 text-[#0ea5e9]'
                    : 'text-gray-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                <span className={isActive ? 'text-[#0ea5e9]' : 'text-gray-500'}>
                  {tab.icon}
                </span>
                <span className={isActive ? 'text-white' : ''}>{tab.label}</span>
                {tab.live && (
                  <span className="relative flex h-2 w-2 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ea5e9] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ea5e9]"></span>
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
