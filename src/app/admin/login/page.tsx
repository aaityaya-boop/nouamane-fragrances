'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  UserCheck,
  KeyRound,
  ChevronLeft,
  Users
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  slug: string;
  role: string;
  avatar?: string | null;
  lastLoginAt?: string | null;
}

const DEFAULT_PROFILES: AdminProfile[] = [
  {
    id: 'cmuac98h9000010y4w43ocyg0',
    name: 'AYOUB AIT YAHYA',
    email: 'ayoub@nayparfum.ma',
    slug: 'ayoub',
    role: 'OWNER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cmuac98ol000110y4l7yop5w7',
    name: 'NOUAMANE AIT YAHYA',
    email: 'nouamane@nayparfum.ma',
    slug: 'nouamane',
    role: 'OWNER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
];

export default function AdminLogin() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<AdminProfile[]>(DEFAULT_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfiles() {
      try {
        const res = await fetch('/api/admin/auth/profiles');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profiles && data.profiles.length > 0) {
            setProfiles(data.profiles);
          }
        }
      } catch (err) {
        console.error('Failed to load profiles:', err);
      }
    }
    loadProfiles();
  }, []);

  const handleSelectProfile = (profile: AdminProfile) => {
    setSelectedProfile(profile);
    setPassword('');
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedProfile.id,
          profile: selectedProfile.slug,
          email: selectedProfile.email,
          password: password.trim(),
          rememberMe,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Mot de passe incorrect. Veuillez réessayer.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Erreur réseau. Veuillez vérifier votre connexion.');
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between items-center p-4 sm:p-8 relative overflow-hidden selection:bg-[#0ea5e9] selection:text-white">
      {/* Background Ambience / Luxury Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#0ea5e9]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-sky-600/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-5xl flex justify-between items-center py-4 z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
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
            <div className="text-[15px] font-bold tracking-wider text-white">NAY PARFUMS</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#0ea5e9] font-medium">Workspace Admin</div>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
          <ShieldCheck size={14} className="text-[#0ea5e9]" />
          <span>Portail Co-Propriétaires</span>
        </div>
      </header>

      {/* Main Area */}
      <main className="w-full max-w-2xl my-auto z-10 py-8">
        {!selectedProfile ? (
          /* STEP 1: SELECT OWNER PROFILE */
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#0ea5e9] tracking-wider uppercase mb-4">
              <Users size={14} />
              <span>Profils Administrateurs</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
              Qui se connecte ?
            </h1>
            <p className="text-sm text-slate-400 mb-10 max-w-md mx-auto">
              Sélectionnez votre profil propriétaire personnel pour accéder à votre espace de travail NAY.
            </p>

            {/* 2 Profiles Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSelectProfile(profile)}
                  className="group relative bg-[#111111]/90 hover:bg-[#181818] border border-white/10 hover:border-[#0ea5e9] p-8 rounded-3xl text-center transition-all duration-300 hover:shadow-2xl hover:shadow-[#0ea5e9]/20 hover:-translate-y-1.5 cursor-pointer flex flex-col items-center"
                >
                  {/* Glowing Ring */}
                  <div className="relative mb-5">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-sky-500/25 group-hover:scale-105 transition-transform overflow-hidden ring-4 ring-white/10 group-hover:ring-[#0ea5e9]/50">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{getInitials(profile.name)}</span>
                      )}
                    </div>
                    {/* Status Dot */}
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#111] rounded-full shadow-sm" />
                  </div>

                  {/* Name & Role */}
                  <h3 className="text-lg font-bold text-white group-hover:text-[#0ea5e9] transition-colors mb-1">
                    {profile.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0ea5e9]/10 text-[#38bdf8] text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Sparkles size={11} />
                    <span>Propriétaire Fondateur</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-full">
                    {profile.email}
                  </p>

                  <div className="mt-5 w-full py-2.5 rounded-xl bg-white/5 group-hover:bg-[#0ea5e9] text-slate-300 group-hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                    <span>Sélectionner</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* STEP 2: ENTER PASSWORD FOR SELECTED PROFILE */
          <div className="max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProfile(null)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors cursor-pointer group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Changer d'administrateur</span>
            </button>

            <div className="bg-[#111111]/95 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-black/80">
              
              {/* Selected Profile Header */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-blue-600 text-white mx-auto flex items-center justify-center text-2xl font-bold shadow-lg shadow-sky-500/25 mb-3 overflow-hidden ring-4 ring-white/10">
                  {selectedProfile.avatar ? (
                    <img src={selectedProfile.avatar} alt={selectedProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(selectedProfile.name)}</span>
                  )}
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0ea5e9]/10 text-[#38bdf8] text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>Profil Propriétaire</span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedProfile.name}</h2>
                <p className="text-xs text-slate-400">{selectedProfile.email}</p>
              </div>

              {/* Password Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in duration-200">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-[#181818] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#181818] border-white/20 text-[#0ea5e9] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#0ea5e9]"
                    />
                    <span>Rester connecté (30 jours)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Vérification...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={15} />
                      <span>Ouvrir ma session</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="text-xs text-slate-500 hover:text-slate-300 underline"
                >
                  Ce n'est pas vous ? Changer de profil
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-4 text-xs text-slate-600 z-10">
        NAY Parfums Maroc © {new Date().getFullYear()} • Système d'administration multi-propriétaires sécurisé
      </footer>
    </div>
  );
}
