'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, 
  ShieldCheck, 
  History, 
  LogOut, 
  ExternalLink, 
  ChevronDown, 
  Sparkles,
  CheckCircle2,
  Users
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  lastLoginAt?: string | null;
  lastActivityAt?: string | null;
}

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hide header on login page
  if (pathname === '/admin/login') return null;

  useEffect(() => {
    let isMounted = true;
    async function fetchMe() {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setCurrentUser(data.user);
            setTeamMembers(data.teamMembers || []);
          }
        }
      } catch (err) {
        console.error('Failed to load admin profile in header:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchMe();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      isMounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Extract initials for fallback avatar
  const getInitials = (name?: string) => {
    if (!name) return 'NA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'OWNER':
        return 'Propriétaire';
      case 'MANAGER':
        return 'Manager';
      case 'STOCK_MANAGER':
        return 'Gestionnaire Stock';
      case 'MARKETING':
        return 'Marketing';
      default:
        return 'Administrateur';
    }
  };

  // Find co-owner (the other owner)
  const otherOwner = teamMembers.find(
    (m) => m.role === 'OWNER' && m.id !== currentUser?.id
  );

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] px-4 lg:px-8 py-3.5 mb-6 rounded-2xl shadow-sm flex items-center justify-between transition-all">
      {/* Left: Quick Workspace Badge / Context */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-[12px] font-medium text-slate-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Boutique en ligne</span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-[#0ea5e9] transition-colors"
          title="Voir la boutique publique"
        >
          <span>nayparfum.ma</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* Right: Co-Owners & User Profile Dropdown */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Workspace Owners Indicator on Desktop */}
        {teamMembers.length > 0 && (
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200/60 text-[11px] text-slate-500">
            <Users size={13} className="text-[#0ea5e9]" />
            <span>Co-propriétaires :</span>
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              {teamMembers
                .filter((m) => m.role === 'OWNER')
                .map((m, idx) => (
                  <span key={m.id} className="flex items-center gap-1">
                    {idx > 0 && <span className="text-slate-300">•</span>}
                    <span className={m.id === currentUser?.id ? 'text-[#0ea5e9]' : ''}>
                      {m.name.split(' ')[0]}
                    </span>
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
            aria-label="Menu profil utilisateur"
          >
            {/* Avatar Pill */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center text-xs font-bold shadow-sm border border-white">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>{getInitials(currentUser?.name)}</span>
              )}
            </div>

            {/* User Info */}
            <div className="text-left hidden sm:block">
              <div className="text-[13px] font-semibold text-slate-900 leading-tight">
                {isLoading ? 'Chargement...' : currentUser?.name || 'Administrateur'}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#0ea5e9] leading-tight">
                {getRoleLabel(currentUser?.role)}
              </div>
            </div>

            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-slate-700' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-sky-500/20">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{getInitials(currentUser?.name)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400 font-medium">Statut compte</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={11} />
                    Actif
                  </span>
                </div>
              </div>

              {/* Co-Owner Quick Info */}
              {otherOwner && (
                <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users size={12} className="text-[#0ea5e9]" />
                    <span>Autre propriétaire :</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {otherOwner.name}
                  </span>
                </div>
              )}

              {/* Menu Links */}
              <div className="py-1">
                <Link
                  href="/admin/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0ea5e9] transition-colors"
                >
                  <User size={15} />
                  <span>Mon Profil & Paramètres</span>
                </Link>

                <Link
                  href="/admin/profile?tab=security"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0ea5e9] transition-colors"
                >
                  <ShieldCheck size={15} />
                  <span>Sécurité & Mot de Passe</span>
                </Link>

                <Link
                  href="/admin/profile?tab=activity"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0ea5e9] transition-colors"
                >
                  <History size={15} />
                  <span>Journal d'Activité</span>
                </Link>
              </div>

              {/* Footer / Logout */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
