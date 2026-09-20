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
  AlertCircle,
  KeyRound,
  UserCheck
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
        router.push('/admin');
        router.refresh();
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
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between items-center p-4 sm:p-8 relative overflow-hidden selection:bg-[#0ea5e9] selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-sky-600/5 rounded-full blur-[120px] pointer-events-none" />

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
          <span>Accès Personnel Sécurisé</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md my-auto z-10 py-6">
        <div className="bg-[#111111]/95 backdrop-blur-xl border border-white/10 p-8 sm:p-9 rounded-3xl shadow-2xl shadow-black/80">
          
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#0ea5e9] tracking-wider uppercase mb-3">
              <UserCheck size={13} />
              <span>Connexion Compte Personnel</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              NAY Workspace
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Connectez-vous avec votre compte propriétaire personnel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in duration-200">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email / Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email ou Identifiant personnel
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                  placeholder="nom@nayparfum.ma"
                  className="w-full pl-10 pr-4 py-3 bg-[#181818] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Mot de passe personnel
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                  className="w-full pl-10 pr-10 py-3 bg-[#181818] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#181818] border-white/20 text-[#0ea5e9] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#0ea5e9]"
                />
                <span>Garder ma session active (30 jours)</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authentification...</span>
                </>
              ) : (
                <>
                  <KeyRound size={15} />
                  <span>Se connecter à mon compte</span>
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-4 text-xs text-slate-600 z-10">
        NAY Parfums Maroc © {new Date().getFullYear()} • Chaque propriétaire dispose de son propre compte d'administration sécurisé
      </footer>
    </div>
  );
}
