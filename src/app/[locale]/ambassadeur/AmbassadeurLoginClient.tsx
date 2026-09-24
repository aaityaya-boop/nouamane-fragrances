'use client';

import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AmbassadeurLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ambassadeur/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error || 'Identifiants incorrects');
      }
    } catch {
      setError('Impossible de se connecter au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50/70 font-sans text-neutral-900">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-sky-200 p-2 flex items-center justify-center shadow-xs mx-auto mb-3">
            <Image 
              src="/images/nay/nay-logo-blue.png" 
              alt="NAY Logo" 
              width={48} 
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
              NAY Parfums • Espace Partenaires
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Portail Ambassadeurs & VIP
          </h1>
          <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
            Connectez-vous pour suivre vos visites, leads, commandes et demander vos virements de commissions.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center font-medium animate-in fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Adresse E-mail Partenaire
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre-email@exemple.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Mot de Passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-neutral-900 hover:bg-black text-white font-semibold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Accéder à mon tableau de bord</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Accès sécurisé NAY</span>
            </div>
            <a
              href="https://wa.me/212663380011?text=Bonjour,%20je%20souhaite%20devenir%20ambassadeur%20NAY%20Parfums"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-900 hover:underline font-semibold"
            >
              Assistance Partenaire
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
