'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Lock, 
  ArrowRight, 
  RefreshCw,
  Activity,
  Award,
  KeyRound,
  ExternalLink
} from 'lucide-react';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  slug: string;
  role: string;
  status: string;
  avatar?: string | null;
  lastLoginAt?: string | null;
  lastActivityAt?: string | null;
  createdAt?: string | null;
}

export default function AdminProfilesPage() {
  const [currentUser, setCurrentUser] = useState<AdminProfile | null>(null);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
          setProfiles(data.teamMembers || []);
        }
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return 'NA';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nameStr.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Jamais';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSwitchProfile = async () => {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/admin/login';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b1120] via-[#1e293b] to-[#0b1120] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30 flex items-center gap-1.5">
                <Users size={13} />
                <span>Gestion des Administrateurs</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                2 Profils Actifs
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Profils Administrateurs NAY
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Les deux fondateurs et propriétaires de <strong>NAY Parfum</strong> disposent chacun de leur profil d'administration personnalisé.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/profile"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/15 transition-all flex items-center gap-2"
            >
              <User size={14} />
              <span>Paramètres de mon profil</span>
            </Link>

            <button
              onClick={handleSwitchProfile}
              className="px-4 py-2.5 bg-[#0ea5e9] hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
            >
              <KeyRound size={14} />
              <span>Changer d'administrateur</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2 Main Owner Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile) => {
          const isCurrent = profile.id === currentUser?.id;
          return (
            <div
              key={profile.id}
              className={`rounded-3xl p-6 sm:p-8 transition-all relative overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'bg-white border-2 border-[#0ea5e9] shadow-xl ring-4 ring-[#0ea5e9]/10'
                  : 'bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-[#0ea5e9] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                  Session Active (Vous)
                </div>
              )}

              <div>
                {/* Avatar & Role Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg shadow-sky-500/20 ring-4 ring-slate-100 shrink-0 overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(profile.name)}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-0.5 rounded-md mb-1">
                      <Sparkles size={11} />
                      <span>Co-Propriétaire Fondateur</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 truncate">
                      {profile.name}
                    </h2>
                    <p className="text-xs text-slate-500 truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>

                {/* Permissions & Access Scope */}
                <div className="space-y-2.5 mb-6">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Droits & Périmètre d'Accès
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-700">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>Catalogue & Stock</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-700">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>Commandes & Ventes</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-700">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>Clients & Contacts</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-700">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>Finances & Rapports</span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-600 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Dernière connexion :</span>
                    <strong className="text-slate-800">{formatDate(profile.lastLoginAt)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Dernière activité :</span>
                    <strong className="text-slate-800">{formatDate(profile.lastActivityAt)}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                {isCurrent ? (
                  <Link
                    href="/admin/profile"
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-center rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <User size={14} />
                    <span>Modifier mes infos & mot de passe</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleSwitchProfile}
                    className="w-full py-2.5 bg-[#0ea5e9]/10 hover:bg-[#0ea5e9] text-[#0ea5e9] hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound size={14} />
                    <span>Se connecter en tant que {profile.name.split(' ')[0]}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shared Store Architecture Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs uppercase font-bold tracking-widest text-[#38bdf8]">
            Architecture Partagée & Traçabilité
          </div>
          <h3 className="text-lg font-bold text-white">
            100% des données en temps réel pour Ayoub & Nouamane
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Chaque propriétaire dispose de son propre mot de passe et de sa propre signature dans le Journal d'Activité. Toutes les commandes, testeurs, parfums, clients et rapports restent unifiés et synchronisés instantanément.
          </p>
        </div>

        <Link
          href="/admin/profile?tab=activity"
          className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/15 transition-all shrink-0 flex items-center gap-2"
        >
          <Activity size={14} />
          <span>Voir le Journal d'Audit</span>
        </Link>
      </div>
    </div>
  );
}
