'use client';

import React, { useState } from 'react';
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
  Globe
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier.trim(),
          password: password.trim(),
          rememberMe,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLoginSuccess(true);
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 600);
      } else {
        setErrorMessage(data.error || 'Identifiant ou mot de passe incorrect.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Erreur réseau. Veuillez vérifier votre connexion.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-neutral-100 flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* ================= LEFT / SHOWCASE BRAND PANEL ================= */}
      <div className="relative w-full lg:w-[54%] p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-800/60 bg-gradient-to-br from-[#0c1222]/90 via-[#070b14]/95 to-[#04060b]/90 backdrop-blur-xl z-10">
        
        {/* Brand Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-900 border border-sky-500/30 p-2 shadow-lg shadow-sky-500/10 flex items-center justify-center group-hover:border-sky-400/60 transition-all duration-300">
              <Image 
                src="/images/nay/nay-logo-blue.png" 
                alt="NAY Parfums" 
                width={36} 
                height={36}
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-wider text-white group-hover:text-sky-300 transition-colors">
                  NAY PARFUMS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-widest">
                  Maison
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
                Workspace Administrateur
              </p>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-neutral-400">Système Opérationnel</span>
          </div>
        </div>

        {/* Hero Showcase Center */}
        <div className="my-10 lg:my-auto max-w-lg">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium mb-6 backdrop-blur-sm">
            <Sparkles size={13} className="text-sky-400" />
            <span>Portail de Gestion & Pilotage Stratégique</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            L'excellence de la{' '}
            <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Haute Parfumerie
            </span>{' '}
            marocaine.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed font-light">
            Gérez votre catalogue de fragrances exclusives, suivez les commandes en temps réel, optimisez votre logistique et pilotez les performances financières avec précision.
          </p>

          {/* Quick Feature Pillars */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-sky-500/30 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                  <PackageCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Catalogue & Stocks</h4>
                  <p className="text-[11px] text-neutral-400">Inventaire en direct</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-sky-500/30 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                  <BarChart3 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Analyses Financières</h4>
                  <p className="text-[11px] text-neutral-400">Revenus & marges nets</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-sky-500/30 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">IA & Visibilité SEO</h4>
                  <p className="text-[11px] text-neutral-400">Maroc & International</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-sky-500/30 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Sécurité Maximale</h4>
                  <p className="text-[11px] text-neutral-400">Auth chiffrée AES-256</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel Info */}
        <div className="pt-6 border-t border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-neutral-400" />
            <span>NAY Parfums • Casablanca & International</span>
          </div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-sky-400 transition-colors group"
          >
            <span>Boutique publique</span>
            <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ================= RIGHT / AUTH FORM PANEL ================= */}
      <div className="w-full lg:w-[46%] p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center relative z-10 bg-[#070b14]/60 backdrop-blur-2xl">
        
        <div className="w-full max-w-md">
          
          {/* Login Card Header */}
          <div className="text-center mb-8">
            <div className="inline-flex relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-neutral-900/90 border border-sky-500/30 p-3.5 shadow-xl shadow-sky-500/10 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-transparent to-indigo-500/10 opacity-50" />
                <Image 
                  src="/images/nay/nay-logo-blue.png" 
                  alt="NAY Logo" 
                  width={64} 
                  height={64}
                  className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_0_12px_rgba(14,165,233,0.6)]"
                  priority
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-neutral-950 border-2 border-neutral-900 flex items-center justify-center text-sky-400 shadow-md">
                <LockKeyhole size={12} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              Espace Administrateur
            </h2>
            <p className="text-xs text-neutral-400 mt-1.5">
              Connectez-vous pour accéder à votre console de gestion
            </p>
          </div>

          {/* Form Box */}
          <div className="p-7 sm:p-8 rounded-2xl bg-neutral-900/80 border border-neutral-800/90 shadow-2xl shadow-black/50 backdrop-blur-xl relative">
            
            {/* Success Notification Banner */}
            {loginSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-200">Connexion réussie !</p>
                  <p className="text-[11px] text-emerald-300/80">Redirection vers le tableau de bord...</p>
                </div>
              </div>
            )}

            {/* Error Notification Banner */}
            {errorMessage && !loginSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle size={18} className="shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-200">Échec de connexion</p>
                  <p className="text-[11px] text-rose-300/80 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Email professionnel ou Identifiant
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="admin@nayparfum.ma"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:bg-neutral-950 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-neutral-300">
                    Mot de passe
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:bg-neutral-950 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-400 hover:text-neutral-200 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-sky-500 focus:ring-sky-500/20 focus:ring-offset-0 cursor-pointer accent-sky-500"
                  />
                  <span>Mémoriser ma session (30 jours)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || loginSuccess}
                className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Vérification des accès...</span>
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

            {/* Micro Badge Bottom */}
            <div className="mt-6 pt-5 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck size={14} className="text-sky-400" />
              <span>Session protégée par chiffrement de bout en bout</span>
            </div>

          </div>

          {/* Quick Support / Legal */}
          <div className="mt-6 text-center text-xs text-neutral-400">
            <p>
              Besoin d'assistance ? Contactez le support technique NAY.
            </p>
            <p className="mt-1 text-[11px] text-neutral-400">
              NAY Parfums Maroc © {new Date().getFullYear()} • Tous droits réservés
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
