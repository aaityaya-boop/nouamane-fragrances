'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  ExternalLink,
  Layers,
  BarChart3,
  PackageCheck,
  Zap,
  Globe,
  Check,
  KeyRound,
  Fingerprint,
  Clock
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminLogin() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Security & Stability: Brute-Force cooldown protection
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cooldownSeconds > 0) {
      setErrorMessage(`Trop de tentatives. Veuillez patienter ${cooldownSeconds}s avant de réessayer.`);
      return;
    }

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('Veuillez remplir votre identifiant et votre mot de passe.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: cleanIdentifier,
          password: cleanPassword,
          rememberMe,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setLoginSuccess(true);
        setFailedAttempts(0);
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 600);
      } else {
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        
        if (attempts >= 4) {
          const timeout = attempts * 5; // 20s, 25s, etc.
          setCooldownSeconds(timeout);
          setErrorMessage(`Sécurité activée : ${attempts} tentatives infructueuses. Réessayez dans ${timeout} secondes.`);
        } else {
          setErrorMessage(data?.error || 'Identifiant ou mot de passe incorrect.');
        }
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Erreur réseau. Veuillez vérifier votre connexion internet et réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 flex flex-col lg:flex-row relative overflow-x-hidden font-sans selection:bg-[#1D9BF0]/20 selection:text-[#0074bd]">
      
      {/* Background Soft Glow Accents in Twitter Sky Blue */}
      <div className="fixed top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-400/15 to-[#1D9BF0]/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-sky-300/20 via-blue-400/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/3 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-sky-200/20 blur-[120px] pointer-events-none" />

      {/* Subtle Luxury Dot Grid Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.045]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1D9BF0 1px, transparent 0)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* ================= LEFT / SHOWCASE BRAND PANEL ================= */}
      <div className="relative w-full lg:w-[54%] xl:w-[56%] p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-gradient-to-br from-slate-50/90 via-sky-50/20 to-white/90 backdrop-blur-md z-10">
        
        {/* Brand Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3.5 group">
            <div className="relative w-12 h-12 rounded-2xl bg-white border border-sky-200 p-2 shadow-md shadow-sky-500/10 flex items-center justify-center group-hover:border-[#1D9BF0] group-hover:shadow-sky-500/20 transition-all duration-300">
              <Image 
                src="/images/nay/nay-logo-blue.png" 
                alt="NAY Parfums" 
                width={40} 
                height={40}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(29,155,240,0.35)]"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-wider text-slate-900 group-hover:text-[#1D9BF0] transition-colors">
                  NAY PARFUMS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100/80 text-[#0284c7] border border-sky-200 uppercase tracking-widest">
                  Maison
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600 font-semibold">
                Workspace Administrateur
              </p>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/90 text-xs text-slate-700 shadow-xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-medium text-slate-700">Système Opérationnel</span>
          </div>
        </div>

        {/* Hero Showcase Center */}
        <div className="my-10 lg:my-auto max-w-xl">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/70 border border-sky-200/80 text-[#0284c7] text-xs font-semibold mb-6 shadow-xs">
            <Sparkles size={13} className="text-[#1D9BF0]" />
            <span>Portail Sécurisé de Gestion & Pilotage</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
            L'excellence de la{' '}
            <span className="bg-gradient-to-r from-[#1D9BF0] via-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent">
              Haute Parfumerie
            </span>{' '}
            marocaine.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Gérez l'ensemble des créations parfumées, suivez les commandes en temps réel, pilotez les expéditions à travers le Royaume et analysez la croissance avec une précision absolue.
          </p>

          {/* Quick Feature Pillars (Light Theme Cards) */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md hover:shadow-sky-500/5 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1D9BF0] group-hover:bg-[#1D9BF0] group-hover:text-white transition-all">
                  <PackageCheck size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Catalogue & Stocks</h4>
                  <p className="text-[11px] text-slate-600 font-medium">Inventaire et formules en direct</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md hover:shadow-sky-500/5 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1D9BF0] group-hover:bg-[#1D9BF0] group-hover:text-white transition-all">
                  <BarChart3 size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Analyses Financières</h4>
                  <p className="text-[11px] text-slate-600 font-medium">Revenus, marges et commandes</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md hover:shadow-sky-500/5 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1D9BF0] group-hover:bg-[#1D9BF0] group-hover:text-white transition-all">
                  <Zap size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">IA & Moteur SEO</h4>
                  <p className="text-[11px] text-slate-600 font-medium">Visibilité Maroc & International</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md hover:shadow-sky-500/5 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1D9BF0] group-hover:bg-[#1D9BF0] group-hover:text-white transition-all">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sécurité & Chiffrement</h4>
                  <p className="text-[11px] text-slate-600 font-medium">Sessions protégées AES-256</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel Info */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-[#1D9BF0]" />
            <span className="font-medium">Maison NAY Parfums • Casablanca, Maroc</span>
          </div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#1D9BF0] font-semibold transition-colors group"
          >
            <span>Boutique publique</span>
            <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ================= RIGHT / AUTH FORM PANEL (WHITE & SKY BLUE) ================= */}
      <div className="w-full lg:w-[46%] xl:w-[44%] p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center relative z-10 bg-white/70 backdrop-blur-xl">
        
        <div className="w-full max-w-md">
          
          {/* Official Logo Display Above Form */}
          <div className="text-center mb-8">
            <div className="inline-flex relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white border border-sky-200 p-3 shadow-xl shadow-sky-500/15 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/10 via-transparent to-blue-500/10 opacity-70" />
                <Image 
                  src="/images/nay/nay-logo-blue.png" 
                  alt="NAY Logo" 
                  width={64} 
                  height={64}
                  className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_2px_10px_rgba(29,155,240,0.4)]"
                  priority
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1D9BF0] border-2 border-white flex items-center justify-center text-white shadow-md">
                <LockKeyhole size={11} />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Espace Administrateur
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Identifiez-vous pour accéder à votre console de gestion
            </p>
          </div>

          {/* Clean White Card with Sky Blue Highlights */}
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_40px_rgba(0,0,0,0.06)] relative">
            
            {/* Success Notification Banner */}
            {loginSuccess && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <div>
                  <p className="font-bold text-emerald-900">Connexion réussie !</p>
                  <p className="text-[11px] text-emerald-700">Redirection vers le tableau de bord...</p>
                </div>
              </div>
            )}

            {/* Error Notification Banner */}
            {errorMessage && !loginSuccess && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-900">Échec de connexion</p>
                  <p className="text-[11px] text-rose-700 mt-0.5 font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Cooldown Counter Banner */}
            {cooldownSeconds > 0 && (
              <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <Clock size={16} className="text-amber-600 shrink-0" />
                <span>Protection active : attendez <strong>{cooldownSeconds}s</strong> avant de réessayer.</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email ou Identifiant
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    disabled={isLoading || loginSuccess || cooldownSeconds > 0}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="admin@nayparfum.ma"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1D9BF0] focus:ring-4 focus:ring-sky-500/15 transition-all font-medium disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Mot de passe
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading || loginSuccess || cooldownSeconds > 0}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1D9BF0] focus:ring-4 focus:ring-sky-500/15 transition-all font-mono tracking-wider disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600 hover:text-slate-900 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#1D9BF0] focus:ring-[#1D9BF0]/30 focus:ring-offset-0 cursor-pointer accent-[#1D9BF0]"
                  />
                  <span className="font-medium">Garder ma session active (30 jours)</span>
                </label>
              </div>

              {/* Submit Button in Twitter Sky Blue */}
              <button
                type="submit"
                disabled={isLoading || loginSuccess || cooldownSeconds > 0}
                className="w-full mt-3 py-3.5 px-4 bg-[#1D9BF0] hover:bg-[#1a8cd8] active:bg-[#177cc0] text-white rounded-xl text-xs sm:text-sm font-bold tracking-wide shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authentification sécurisée...</span>
                  </>
                ) : loginSuccess ? (
                  <>
                    <CheckCircle2 size={16} className="text-white" />
                    <span>Accès Autorisé</span>
                  </>
                ) : (
                  <>
                    <span>Accéder au Tableau de Bord</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Micro Security Trust Line */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-600">
              <ShieldCheck size={14} className="text-[#1D9BF0]" />
              <span className="font-semibold">Session protégée par chiffrement SSL / AES-256</span>
            </div>

          </div>

          {/* Support Info */}
          <div className="mt-6 text-center text-xs text-slate-600">
            <p className="font-medium">
              Besoin d'assistance ? Contactez le support technique NAY.
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              NAY Parfums Maroc © {new Date().getFullYear()} • Tous droits réservés
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
