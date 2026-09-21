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
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  ExternalLink,
  Clock,
  Sparkles
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
      setErrorMessage('Veuillez renseigner votre identifiant et votre mot de passe.');
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
        }, 500);
      } else {
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        
        if (attempts >= 4) {
          const timeout = attempts * 5;
          setCooldownSeconds(timeout);
          setErrorMessage(`Compte temporairement protégé : réessayez dans ${timeout} secondes.`);
        } else {
          setErrorMessage(data?.error || 'Identifiant ou mot de passe incorrect.');
        }
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Erreur de connexion. Veuillez vérifier votre réseau et réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 flex flex-col lg:flex-row relative overflow-x-hidden selection:bg-[#1D9BF0]/15 selection:text-[#1D9BF0]">
      
      {/* Subtle Sky-Blue Ambient Atmospheric Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1D9BF0]/[0.06] blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#1D9BF0]/[0.05] blur-[140px] pointer-events-none" />

      {/* ================= LEFT SHOWCASE PANEL ================= */}
      <div className="relative w-full lg:w-[52%] xl:w-[54%] p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 z-10">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-2 shadow-xs flex items-center justify-center group-hover:border-[#1D9BF0] transition-colors">
              <Image 
                src="/images/nay/nay-logo-blue.png" 
                alt="NAY Parfums" 
                width={32} 
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-slate-900 group-hover:text-[#1D9BF0] transition-colors">
                NAY PARFUMS
              </div>
              <div className="text-[11px] text-slate-500 font-normal">
                Maison de Haute Parfumerie
              </div>
            </div>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-600">Système opérationnel</span>
          </div>
        </div>

        {/* Center Editorial Info */}
        <div className="my-10 lg:my-auto max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-100 text-[#0284c7] text-xs font-medium mb-5">
            <Sparkles size={12} className="text-[#1D9BF0]" />
            <span>Portail Administrateur</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight leading-snug">
            Gestion centralisée de la Maison NAY Parfums.
          </h1>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Consultez les commandes en direct, administrez le catalogue des créations olfactives, et suivez la performance de vos ventes à travers le Maroc.
          </p>

          {/* Clean Information Highlights */}
          <div className="mt-8 space-y-3 pt-6 border-t border-slate-200/70">
            <div className="flex items-start gap-3 text-xs">
              <div className="w-5 h-5 rounded-md bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1D9BF0] shrink-0 mt-0.5">
                <CheckCircle2 size={13} />
              </div>
              <div>
                <span className="font-medium text-slate-900">Synchronisation des stocks en temps réel</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Suivi continu des flacons et réapprovisionnements.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-5 h-5 rounded-md bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1D9BF0] shrink-0 mt-0.5">
                <CheckCircle2 size={13} />
              </div>
              <div>
                <span className="font-medium text-slate-900">Traitement logistique & expéditions</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Bordereaux AWB et livraisons partout au Maroc.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-5 h-5 rounded-md bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1D9BF0] shrink-0 mt-0.5">
                <CheckCircle2 size={13} />
              </div>
              <div>
                <span className="font-medium text-slate-900">Authentification & sécurité bancaire</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Chiffrement AES-256 et sessions cryptées.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Casablanca, Maroc</span>
          <Link 
            href="/" 
            className="inline-flex items-center gap-1 text-slate-700 hover:text-[#1D9BF0] font-medium transition-colors group"
          >
            <span>Boutique publique</span>
            <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-[#1D9BF0]" />
          </Link>
        </div>
      </div>

      {/* ================= RIGHT LOGIN FORM PANEL ================= */}
      <div className="w-full lg:w-[48%] xl:w-[46%] p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center relative z-10 bg-white">
        
        <div className="w-full max-w-sm">
          
          {/* Brand Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-2.5 shadow-sm flex items-center justify-center relative">
                <Image 
                  src="/images/nay/nay-logo-blue.png" 
                  alt="NAY Logo" 
                  width={48} 
                  height={48}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
              Espace Administrateur
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Card Form */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            
            {/* Success Notification */}
            {loginSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900">Connexion réussie</p>
                  <p className="text-[11px] text-emerald-700">Redirection vers le tableau de bord...</p>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && !loginSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900">Erreur d'authentification</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Cooldown Timer */}
            {cooldownSeconds > 0 && (
              <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Clock size={14} className="text-amber-600 shrink-0" />
                <span>Veuillez patienter <strong>{cooldownSeconds}s</strong> avant de réessayer.</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email ou Identifiant
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
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
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]/15 transition-colors disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Mot de passe
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
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
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]/15 transition-colors disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#1D9BF0] focus:ring-[#1D9BF0]/20 focus:ring-offset-0 cursor-pointer accent-[#1D9BF0]"
                  />
                  <span>Garder ma session active (30 jours)</span>
                </label>
              </div>

              {/* Submit CTA Button in Twitter Sky Blue */}
              <button
                type="submit"
                disabled={isLoading || loginSuccess || cooldownSeconds > 0}
                className="w-full mt-2 py-2.5 px-4 bg-[#1D9BF0] hover:bg-[#1a8cd8] active:bg-[#177cc0] text-white rounded-lg text-xs font-semibold tracking-normal shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authentification...</span>
                  </>
                ) : loginSuccess ? (
                  <>
                    <CheckCircle2 size={15} className="text-white" />
                    <span>Accès Autorisé</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck size={13} className="text-[#1D9BF0]" />
              <span>Session sécurisée par chiffrement de bout en bout</span>
            </div>

          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            NAY Parfums Maroc © {new Date().getFullYear()} • Accès réservé
          </div>

        </div>

      </div>

    </div>
  );
}
