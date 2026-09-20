'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles, 
  Gift, 
  Menu, 
  X, 
  Star, 
  Activity,
  User,
  ShieldCheck,
  CheckSquare,
  History,
  Bell,
  Film,
  Banknote
} from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

const TEAM_ITEMS: MenuItem[] = [
  { href: '/admin/team', label: 'Gestion Équipe (RBAC)', icon: <ShieldCheck size={18} />, permission: 'team.view' },
  { href: '/admin/team/roles', label: 'Annuaire des 26 Rôles', icon: <Users size={18} />, permission: 'team.view' },
  { href: '/admin/tasks', label: 'Missions & Tâches', icon: <CheckSquare size={18} />, permission: 'tasks.view' },
  { href: '/admin/chat', label: 'NAY Chat (WhatsApp)', icon: <MessageSquare size={18} /> },
  { href: '/admin/notifications', label: 'Notifications & Alertes', icon: <Bell size={18} /> },
  { href: '/admin/activity', label: 'Journal d\'Activité', icon: <History size={18} />, permission: 'activity.view_own' },
];

const MENU_ITEMS: MenuItem[] = [
  { href: '/admin', label: 'Tableau de bord', icon: <LayoutDashboard size={18} />, permission: 'dashboard.view' },
  { href: '/admin/finance', label: 'Finance & CA Net', icon: <TrendingUp size={18} />, permission: 'finance.view_revenue' },
  { href: '/admin/finance?tab=EXPENSES', label: 'Charges & Dépenses', icon: <Banknote size={18} />, permission: 'finance.view_costs' },
  { href: '/admin/orders', label: 'Commandes', icon: <ShoppingBag size={18} />, permission: 'orders.view' },
  { href: '/admin/reviews', label: 'Avis Clients', icon: <Star size={18} />, permission: 'reviews.view' },
  { href: '/admin/products', label: 'Testeurs', icon: <PackageSearch size={18} />, permission: 'products.view' },
  { href: '/admin/coffrets', label: 'Coffrets Cadeaux', icon: <Gift size={18} />, permission: 'products.view' },
  { href: '/admin/parfums-originaux', label: 'Parfums Originaux', icon: <Sparkles size={18} />, permission: 'products.view' },
  { href: '/admin/master-copier', label: 'Master Copy', icon: <Sparkles size={18} />, permission: 'products.edit' },
  { href: '/admin/inventory', label: 'Inventaire', icon: <Archive size={18} />, permission: 'inventory.view' },
  { href: '/admin/brands', label: 'Marques', icon: <Bookmark size={18} />, permission: 'products.view' },
];

const CRM_ITEMS: MenuItem[] = [
  { href: '/admin/customers', label: 'Tous les Clients', icon: <Users size={18} />, permission: 'customers.view' },
  { href: '/admin/customers/vip', label: 'Clients VIP', icon: <Star size={18} />, permission: 'customers.view_vip' },
  { href: '/admin/reviews', label: 'Avis Clients', icon: <MessageSquare size={18} />, permission: 'reviews.view' },
];

const MARKETING_ITEMS: MenuItem[] = [
  { href: '/admin/creatives', label: 'Créatifs Pubs (Ads Hub)', icon: <Film size={18} />, permission: 'marketing.manage_creatives' },
  { href: '/admin/marketing', label: 'Retention & Marketing', icon: <TrendingUp size={18} />, permission: 'marketing.view' },
  { href: '/admin/marketing/campaigns', label: 'Campagnes', icon: <Mail size={18} />, permission: 'marketing.manage_campaigns' },
  { href: '/admin/marketing/live-carts', label: 'Paniers en direct', icon: <Activity size={18} />, permission: 'marketing.view_analytics' },
  { href: '/admin/landing-pages', label: 'Landing Pages', icon: <LayoutTemplate size={18} />, permission: 'marketing.manage_landing_pages' },
  { href: '/admin/promos', label: 'Codes Promo', icon: <Ticket size={18} />, permission: 'marketing.manage_promotions' },
  { href: '/admin/affiliates', label: 'Ambassadeurs', icon: <UserCheck size={18} />, permission: 'marketing.manage_affiliates' },
  { href: '/admin/analytics', label: 'Audience', icon: <TrendingUp size={18} />, permission: 'marketing.view_analytics' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: <Mail size={18} />, permission: 'marketing.manage_newsletter' },
  { href: '/admin/blog', label: 'Blog & SEO', icon: <BookOpen size={18} />, permission: 'marketing.manage_seo' },
];

const SYSTEM_ITEMS: MenuItem[] = [
  { href: '/admin/messages', label: 'Messages', icon: <MessageSquare size={18} />, permission: 'messages.view' },
  { href: '/admin/vitrine', label: 'Vitrine & Recommandés', icon: <Sparkles size={18} />, permission: 'products.edit' },
  { href: '/admin/profile', label: 'Mon Compte Utilisateur', icon: <User size={18} /> },
  { href: '/admin/settings', label: 'Paramètres', icon: <Settings size={18} />, permission: 'settings.view' },
];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  effectivePermissions?: string[];
  isOwner?: boolean;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Failed to load user in sidebar:', err);
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  // Hide sidebar on login page
  if (pathname === '/admin/login') return null;

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/admin/login';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'NA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Check if item is permitted for current user
  const isItemVisible = (item: MenuItem) => {
    if (!user) return true; // optimistic render before auth loads
    if (user.isOwner) return true;
    if (!item.permission) return true;
    return (user.effectivePermissions || []).includes(item.permission);
  };

  const renderLinks = (items: MenuItem[]) => {
    const visibleItems = items.filter(isItemVisible);
    if (visibleItems.length === 0) return null;

    return visibleItems.map((item) => {
      const isExactOrSub = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href.split('?')[0]}/`));
      const isActive = item.href.includes('?') ? `${pathname}${typeof window !== 'undefined' ? window.location.search : ''}` === item.href : isExactOrSub;
      
      return (
        <Link
          key={`${item.href}-${item.label}`}
          href={item.href}
          onClick={() => setIsOpen(false)}
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

  const hasGeneralItems = MENU_ITEMS.some(isItemVisible);
  const hasTeamItems = TEAM_ITEMS.some(isItemVisible);
  const hasCrmItems = CRM_ITEMS.some(isItemVisible);
  const hasMarketingItems = MARKETING_ITEMS.some(isItemVisible);
  const hasSystemItems = SYSTEM_ITEMS.some(isItemVisible);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A] text-white flex items-center justify-between px-4 z-40 border-b border-[#1e1e1e]">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20">
            <div
              className="w-5 h-5 bg-white"
              style={{
                maskImage: 'url("/images/nay/Artboard%202.png")',
                WebkitMaskImage: 'url("/images/nay/Artboard%202.png")',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            />
          </div>
          <div className="text-[15px] font-bold text-white tracking-wide">NAY Admin</div>
        </Link>
        <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[260px] bg-[#0A0A0A] border-r border-[#1e1e1e] h-screen flex flex-col fixed left-0 top-0 z-50 text-gray-300 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Brand Header */}
        <div className="p-6 pb-4 flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20">
              <div
                className="w-5 h-5 bg-white"
                style={{
                  maskImage: 'url("/images/nay/Artboard%202.png")',
                  WebkitMaskImage: 'url("/images/nay/Artboard%202.png")',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                }}
              />
            </div>
            <div>
              <div className="text-[15px] font-bold text-white tracking-wide">NAY</div>
              <div className="text-[10px] uppercase tracking-widest text-[#666] font-semibold">Workspace</div>
            </div>
          </Link>

          {isOpen && (
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-1">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-6 overflow-y-auto mt-2 custom-scrollbar">
          {hasGeneralItems && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#555] mb-2 px-3">Général</div>
              <div className="space-y-0.5">
                {renderLinks(MENU_ITEMS)}
              </div>
            </div>
          )}

          {hasTeamItems && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#0ea5e9] mb-2 px-3 flex items-center gap-1.5">
                <span>Équipe & Collaboration</span>
              </div>
              <div className="space-y-0.5">
                {renderLinks(TEAM_ITEMS)}
              </div>
            </div>
          )}

          {hasCrmItems && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#555] mb-2 px-3">CRM & Clients</div>
              <div className="space-y-0.5">
                {renderLinks(CRM_ITEMS)}
              </div>
            </div>
          )}

          {hasMarketingItems && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#555] mb-2 px-3">Marketing & Ventes</div>
              <div className="space-y-0.5">
                {renderLinks(MARKETING_ITEMS)}
              </div>
            </div>
          )}

          {hasSystemItems && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#555] mb-2 px-3">Système</div>
              <div className="space-y-0.5">
                {renderLinks(SYSTEM_ITEMS)}
              </div>
            </div>
          )}
        </nav>

        {/* Current Connected User Card & Footer */}
        <div className="p-3 border-t border-[#1e1e1e] bg-[#0A0A0A] mt-auto space-y-2">
          {/* User Card */}
          <Link
            href="/admin/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-2 rounded-xl bg-[#141414] hover:bg-[#1c1c1c] border border-white/5 transition-all group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-sky-500/10">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span>{getInitials(user?.name)}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#141414] rounded-full"></span>
            </div>
            
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-semibold text-white truncate group-hover:text-[#0ea5e9] transition-colors">
                {user?.name || 'Chargement...'}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#0ea5e9] bg-[#0ea5e9]/10 px-1.5 py-0.2 rounded">
                  {user?.isOwner ? 'Propriétaire' : (user?.role || 'Membre')}
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1 pt-1">
            <Link 
              href="/" 
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium text-[#888888] hover:bg-[#151515] hover:text-white transition-colors"
              title="Voir la boutique publique"
            >
              <ExternalLink size={13} />
              <span>Boutique</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors"
              title="Déconnexion sécurisée"
            >
              <LogOut size={13} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
