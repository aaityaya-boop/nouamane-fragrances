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
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900 flex flex-col justify-between items-center p-4 sm:p-8 relative">
      {/* Top Header */}
      <header className="w-full max-w-5xl flex justify-between items-center py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-base shadow-xs">
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
            <div className="text-sm font-bold tracking-wider text-neutral-900">NAY PARFUMS</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">Workspace Admin</div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-neutral-600 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <ShieldCheck size={14} className="text-neutral-500" />
          <span className="font-medium">Accès Sécurisé</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md my-auto py-6">
        <div className="bg-white border border-neutral-200 p-7 sm:p-8 rounded-2xl shadow-2xs">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-[11px] font-medium text-neutral-700 uppercase tracking-wider mb-2.5">
              <UserCheck size={12} />
              <span>Connexion Collaborateur</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              NAY Workspace
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Connectez-vous avec votre compte personnel d'administration
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email / Username Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email ou Identifiant
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail size={15} />
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
                  className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock size={15} />
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
                  className="w-full pl-9 pr-9 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 hover:text-neutral-900 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-neutral-100 border-neutral-300 text-neutral-900 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-neutral-900"
                />
                <span>Garder ma session active (30 jours)</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1.5 py-2.5 px-4 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authentification...</span>
                </>
              ) : (
                <>
                  <KeyRound size={14} />
                  <span>Se connecter à mon compte</span>
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-4 text-xs text-neutral-400">
        NAY Parfums Maroc © {new Date().getFullYear()} • Accès sécurisé
      </footer>
    </div>
  );
}
