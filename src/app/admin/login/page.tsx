'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  X,
  KeyRound,
  Users
} from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          password, 
          rememberMe 
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Successful login
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Identifiants invalides. Veuillez réessayer.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Erreur réseau. Veuillez vérifier votre connexion.');
      setIsLoading(false);
    }
  };

  const selectOwner = (ownerEmail: string) => {
    setEmail(ownerEmail);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#0ea5e9] selection:text-white">
      {/* Background Ambience / Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#0ea5e9]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-sky-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-5xl flex justify-between items-center py-4 z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
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
            <div className="text-[14px] font-bold tracking-wider text-white">NAY PARFUMS</div>
            <div className="text-[9px] uppercase tracking-[0.25em] text-[#0ea5e9] font-medium">Workspace Admin</div>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-[12px] text-[#777] bg-[#121212] border border-white/5 px-3 py-1.5 rounded-full">
          <ShieldCheck size={14} className="text-[#0ea5e9]" />
          <span>Accès Sécurisé SSL 256-bit</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md my-auto z-10">
        <div className="bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 p-7 sm:p-9 rounded-3xl shadow-2xl shadow-black/80 relative">
          
          {/* Top Pill */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171717] border border-white/10 text-[11px] font-semibold text-[#0ea5e9] tracking-wider uppercase mb-3">
              <Sparkles size={12} />
              <span>Espace Propriétaires</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Connexion NAY Workspace</h1>
            <p className="text-xs text-[#888] mt-1">
              Connectez-vous avec votre compte propriétaire personnel
            </p>
          </div>

          {/* Quick Owner Switcher Chips */}
          <div className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#666] mb-2 text-center">
              Sélection rapide du compte
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selectOwner('ayoub@nayparfum.ma')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  email.toLowerCase().includes('ayoub')
                    ? 'bg-[#0ea5e9]/10 border-[#0ea5e9] text-white shadow-sm shadow-sky-500/20'
                    : 'bg-[#141414] border-white/5 hover:border-white/15 text-[#999] hover:text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  AY
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Ayoub</div>
                  <div className="text-[10px] text-[#666] truncate">Co-propriétaire</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectOwner('nouamane@nayparfum.ma')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  email.toLowerCase().includes('nouamane')
                    ? 'bg-[#0ea5e9]/10 border-[#0ea5e9] text-white shadow-sm shadow-sky-500/20'
                    : 'bg-[#141414] border-white/5 hover:border-white/15 text-[#999] hover:text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  NO
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Nouamane</div>
                  <div className="text-[10px] text-[#666] truncate">Co-propriétaire</div>
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in duration-200">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1.5">
                Email ou Identifiant
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#555]">
                  <Mail size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="nom@nayparfum.ma"
                  className="w-full pl-10 pr-4 py-3 bg-[#151515] border border-white/10 rounded-xl text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-[#0ea5e9] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#555]">
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
                  className="w-full pl-10 pr-10 py-3 bg-[#151515] border border-white/10 rounded-xl text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#555] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#888] hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#151515] border-white/20 text-[#0ea5e9] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#0ea5e9]"
                />
                <span>Garder ma session active (30 jours)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authentification...</span>
                </>
              ) : (
                <>
                  <KeyRound size={15} />
                  <span>Accéder au Workspace</span>
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-4 text-[11px] text-[#555] z-10">
        © {new Date().getFullYear()} NAY Parfums Maroc. Système de gestion multi-propriétaires sécurisé.
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-[#666] hover:text-white p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Récupération de mot de passe</h3>
                <p className="text-xs text-[#777]">Procédure de sécurité NAY Workspace</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#aaa] leading-relaxed">
              <p>
                Pour garantir la sécurité maximale de la boutique, la réinitialisation des accès propriétaires s'effectue via l'autre co-propriétaire ou via l'accès administrateur direct à la base de données.
              </p>
              <div className="p-3 bg-[#181818] rounded-xl border border-white/5 space-y-1.5">
                <div className="font-semibold text-white">Contacts des propriétaires :</div>
                <div className="text-slate-300">• <strong>Ayoub AIT YAHYA</strong> : ayoub@nayparfum.ma</div>
                <div className="text-slate-300">• <strong>Nouamane AIT YAHYA</strong> : nouamane@nayparfum.ma</div>
              </div>
              <p className="text-[11px] text-[#777]">
                Une fois connecté, vous pouvez changer votre mot de passe à tout moment depuis l'onglet <em>Mon Profil &gt; Sécurité</em>.
              </p>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="mt-5 w-full py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
            >
              Compris, fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
