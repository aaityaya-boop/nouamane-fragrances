'use client';

import React, { useState } from 'react';
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
  Palette,
  Menu,
  X,
  Tag
} from 'lucide-react';

const MENU_ITEMS = [
  { href: '/admin', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/orders', label: 'Commandes', icon: <ShoppingBag size={20} /> },
  { href: '/admin/products', label: 'Produits', icon: <PackageSearch size={20} /> },
  { href: '/admin/inventory', label: 'Inventaire', icon: <Archive size={20} /> },
  { href: '/admin/landing-pages', label: 'Landing Pages (Ads)', icon: <LayoutTemplate size={20} /> },
  { href: '/admin/brands', label: 'Marques', icon: <Bookmark size={20} /> },
  { href: '/admin/promos', label: 'Codes Promo', icon: <Ticket size={20} /> },
  { href: '/admin/blog', label: 'Blog & SEO', icon: <BookOpen size={20} /> },
  { href: '/admin/affiliates', label: 'Ambassadeurs', icon: <UserCheck size={20} /> },
  { href: '/admin/customers', label: 'Clients', icon: <Users size={20} /> },
  { href: '/admin/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
  { href: '/admin/newsletter', label: 'Newsletter', icon: <Mail size={20} /> },
  { href: '/admin/settings', label: 'Paramètres', icon: <Settings size={20} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  // Hide sidebar on login page
  if (pathname === '/admin/login') return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen hidden lg:flex flex-col fixed left-0 top-0 z-40 shadow-sm">
      <div className="p-6">
        <Link href="/admin" className="block text-2xl font-bold tracking-tight text-gray-900">
          Nouamane
        </Link>
        <div className="text-xs font-semibold tracking-widest text-sky-500 uppercase mt-1">
          Administration
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-sky-50 text-sky-600 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link 
          href="/" 
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <ExternalLink size={20} />
          <span className="text-sm">Voir le site</span>
        </Link>
        <button 
          onClick={() => {
            document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/admin/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
