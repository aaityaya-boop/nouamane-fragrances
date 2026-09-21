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
  Flame,
  PhoneCall,
  Contact
} from 'lucide-react';

const MARKETING_TABS = [
  { href: '/admin/marketing', label: "Vue d'ensemble", icon: <LayoutDashboard size={15} /> },
  { href: '/admin/marketing/contacts', label: 'Répertoire Contacts', icon: <PhoneCall size={15} /> },
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
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
              Rétention & Acquisition
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En direct
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Marketing & Rétention Client
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pilotez vos campagnes directes, paniers en direct, relances WhatsApp et répertoire de contacts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/marketing/contacts"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium text-xs transition-colors shadow-2xs"
          >
            <PhoneCall size={13} className="text-neutral-500" />
            <span>Répertoire Contacts</span>
          </Link>

          <Link
            href="/admin/marketing/abandoned-carts"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium text-xs transition-colors shadow-2xs"
          >
            <ShoppingCart size={13} className="text-neutral-500" />
            <span>Paniers Abandonnés</span>
          </Link>

          <Link
            href="/admin/marketing/campaigns/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white font-medium text-xs transition-colors shadow-xs"
          >
            <PlusCircle size={14} />
            <span>Nouvelle Campagne</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs p-1 overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max">
          {MARKETING_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-neutral-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.live && (
                  <span className="relative flex h-1.5 w-1.5 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
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
