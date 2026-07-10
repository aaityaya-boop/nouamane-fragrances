'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PackageSearch, 
  Users, 
  Settings, 
  LogOut,
  ExternalLink,
  Mail,
  LayoutTemplate,
  Bookmark,
  Archive,
  MessageSquare,
  Ticket,
  BookOpen,
  UserCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const MENU_ITEMS = [
  { href: '/admin', label: 'Tableau de bord', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/finance', label: 'Finance & Rapports', icon: <TrendingUp size={18} /> },
  { href: '/admin/orders', label: 'Commandes', icon: <ShoppingBag size={18} /> },
  { href: '/admin/products', label: 'Produits', icon: <PackageSearch size={18} /> },
  { href: '/admin/inventory', label: 'Inventaire', icon: <Archive size={18} /> },
  { href: '/admin/brands', label: 'Marques', icon: <Bookmark size={18} /> },
  { href: '/admin/customers', label: 'Clients', icon: <Users size={18} /> },
];

const MARKETING_ITEMS = [
  { href: '/admin/landing-pages', label: 'Landing Pages', icon: <LayoutTemplate size={18} /> },
  { href: '/admin/promos', label: 'Codes Promo', icon: <Ticket size={18} /> },
  { href: '/admin/affiliates', label: 'Ambassadeurs', icon: <UserCheck size={18} /> },
  { href: '/admin/newsletter', label: 'Newsletter', icon: <Mail size={18} /> },
  { href: '/admin/blog', label: 'Blog & SEO', icon: <BookOpen size={18} /> },
];

const SYSTEM_ITEMS = [
  { href: '/admin/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
  { href: '/admin/vitrine', label: 'Vitrine', icon: <Sparkles size={18} /> },
  { href: '/admin/settings', label: 'Paramètres', icon: <Settings size={18} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  // Hide sidebar on login page
  if (pathname === '/admin/login') return null;

  const renderLinks = (items: typeof MENU_ITEMS) => {
    return items.map((item) => {
      const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
      
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group relative overflow-hidden ${
            isActive 
              ? 'bg-[#1e1e1e] text-white shadow-sm ring-1 ring-white/10' 
              : 'text-[#888888] hover:bg-[#151515] hover:text-white'
          }`}
        >
          <div className={`transition-colors ${isActive ? 'text-[#0ea5e9]' : 'text-[#666] group-hover:text-white'}`}>
            {item.icon}
          </div>
          <span className="relative z-10">{item.label}</span>
          
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#0ea5e9] rounded-r-full shadow-[0_0_10px_#0ea5e9]"></div>
          )}
        </Link>
      );
    });
  };

  return (
    <aside className="w-[260px] bg-[#0A0A0A] border-r border-[#1e1e1e] h-screen hidden lg:flex flex-col fixed left-0 top-0 z-40 text-gray-300">
      
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20">
            N
          </div>
          <div>
            <div className="text-[15px] font-bold text-white tracking-wide">Nouamane</div>
            <div className="text-[10px] uppercase tracking-widest text-[#666] font-semibold">Workspace</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto mt-2 custom-scrollbar">
        
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#555] mb-2 px-3">Général</div>
          <div className="space-y-0.5">
            {renderLinks(MENU_ITEMS)}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#555] mb-2 px-3">Marketing</div>
          <div className="space-y-0.5">
            {renderLinks(MARKETING_ITEMS)}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#555] mb-2 px-3">Système</div>
          <div className="space-y-0.5">
            {renderLinks(SYSTEM_ITEMS)}
          </div>
        </div>

      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-[#1e1e1e] bg-[#0A0A0A] mt-auto">
        <Link 
          href="/" 
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#888888] hover:bg-[#151515] hover:text-white transition-colors"
        >
          <ExternalLink size={16} />
          <span>Visiter la boutique</span>
        </Link>
        <button 
          onClick={() => {
            document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/admin/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-[13px] font-medium text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

