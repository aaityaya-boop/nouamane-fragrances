'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        router.push('/admin');
      } else {
        setError(true);
        setPassword('');
      }
    } catch (err) {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <span className="heading-font text-3xl font-light tracking-[0.28em] text-[#1A1A1A] group-hover:text-[#0ea5e9] transition-colors duration-500">
              NOUAMANE
            </span>
            <div className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[#0ea5e9]">
              Admin Panel
            </div>
          </Link>
        </div>

        <form 
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-2xl shadow-sm border border-[#e0ddd4]"
        >
          <div className="mb-4">
            <label className="block text-[10px] font-bold tracking-[0.25em] uppercase text-[#9A9A9A] mb-3 text-center">
              Identifiant
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(false);
              }}
              placeholder="admin"
              className={`w-full h-12 bg-[#fafaf7] border text-center tracking-[0.2em] rounded-xl px-5 text-[14px] outline-none transition-colors ${
                error ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-[#e0ddd4] focus:border-[#1A1A1A]'
              }`}
            />
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-bold tracking-[0.25em] uppercase text-[#9A9A9A] mb-3 text-center">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="••••••••••••"
              className={`w-full h-12 bg-[#fafaf7] border text-center tracking-[0.2em] rounded-xl px-5 text-[14px] outline-none transition-colors ${
                error ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-[#e0ddd4] focus:border-[#1A1A1A]'
              }`}
            />
            {error && (
              <p className="text-red-500 text-[11px] text-center mt-3">
                Identifiant ou mot de passe incorrect
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[#1A1A1A] text-white rounded-xl text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-black transition-colors"
          >
            Se connecter
          </button>
        </form>
        
        <p className="text-center text-[#9A9A9A] text-[11px] mt-8">
          Accès restreint. Seul le personnel autorisé peut se connecter.
        </p>
      </div>
    </div>
  );
}
