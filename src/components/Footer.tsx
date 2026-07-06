'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MAIN_CATEGORIES } from '@/lib/products';
import { useDictionary } from '@/context/DictionaryContext';

export default function Footer() {
  const dict = useDictionary();
  const [config, setConfig] = useState<any>({});
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(console.error);

    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(console.error);
  }, []);

  return (
    <footer className="bg-[#fafaf7] border-t border-[#e0ddd4] text-[#1A1A1A]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-24">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-14 gap-x-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-block group">
              <span className="heading-font text-3xl font-light tracking-[0.28em] text-[#1A1A1A] group-hover:text-[#0ea5e9] transition-colors duration-500">
                NOUAMANE
              </span>
              <div className="text-[9px] font-semibold tracking-[0.35em] uppercase text-[#0ea5e9]">
                Parfums
              </div>
            </Link>

            <p className="mt-6 max-w-xs text-[#1A1A1A]/60 text-[14px] leading-[1.7]">
              {dict.footer.aboutText}
            </p>

            <div className="mt-8 space-y-2 text-[13px] text-[#1A1A1A]/70">
              <div>📍 {dict.footer.address}</div>
              <div>✆ {config.contactPhone || '+212 5 22 45 67 89'}</div>
              <div>✉ {config.contactEmail || 'contact@nouamane-parfums.ma'}</div>
            </div>

            <div className="flex gap-6 mt-8">
              {config.instagramUrl && (
                <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/50 hover:text-[#0ea5e9] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  Instagram
                </a>
              )}
              {config.facebookUrl && (
                <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/50 hover:text-[#0ea5e9] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  Facebook
                </a>
              )}
              {config.tiktokUrl && (
                <a href={config.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/50 hover:text-[#0ea5e9] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                  TikTok
                </a>
              )}
              {config.whatsappUrl && (
                <a href={config.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/50 hover:text-[#0ea5e9] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  WhatsApp
                </a>
              )}
              {!config.instagramUrl && !config.facebookUrl && !config.tiktokUrl && !config.whatsappUrl && (
                <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/30">
                  Réseaux sociaux bientôt disponibles
                </div>
              )}
            </div>
          </div>

          {/* Boutique */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#1A1A1A]/50 mb-6">
              {dict.footer.boutique}
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/shop" className="text-[13px] text-[#1A1A1A]/70 hover:text-[#0ea5e9] transition-colors">
                  {dict.nav.allFragrances}
                </Link>
              </li>
              {MAIN_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop/${c.slug}`}
                    className="text-[13px] text-[#1A1A1A]/70 hover:text-[#0ea5e9] transition-colors"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Marques */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#1A1A1A]/50 mb-6">
              {dict.nav.brands}
            </h4>
            <ul className="space-y-4">
              {brands.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/brands/${b.slug}`}
                    className="text-[13px] text-[#1A1A1A]/70 hover:text-[#0ea5e9] transition-colors"
                  >
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-3">
            <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#1A1A1A]/50 mb-6">
              {dict.footer.newsletter}
            </h4>
            <p className="text-[#1A1A1A]/60 text-[13px] leading-[1.7] mb-6">
              {dict.footer.newsletterDesc}
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setStatus('loading');
                try {
                  const res = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setStatus('success');
                    setMessage('Merci pour votre inscription !');
                    setEmail('');
                  } else {
                    setStatus('error');
                    setMessage(data.error || 'Erreur');
                  }
                } catch {
                  setStatus('error');
                  setMessage('Erreur réseau');
                }
              }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center border-b border-[#1A1A1A]/20 pb-3 gap-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VOTRE EMAIL"
                  className="flex-1 bg-transparent text-[#1A1A1A] text-[11px] tracking-[0.15em] placeholder:text-[#1A1A1A]/50 focus:outline-none"
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="text-[#0ea5e9] text-[10px] font-bold tracking-[0.2em] uppercase hover:text-[#38bdf8] transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? '...' : "S'inscrire"}
                </button>
              </div>
              {message && (
                <div className={`text-[10px] ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {message}
                </div>
              )}
            </form>

            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 text-[10px] tracking-[0.15em] text-[#1A1A1A]/50 uppercase">
              <Link href="/legal/terms" className="hover:text-[#1A1A1A]/70 transition-colors">Conditions</Link>
              <Link href="/legal/privacy" className="hover:text-[#1A1A1A]/70 transition-colors">Confidentialité</Link>
              <Link href="/contact" className="hover:text-[#1A1A1A]/70 transition-colors">Contact</Link>
              <Link href="/suivi-commande" className="hover:text-[#1A1A1A]/70 transition-colors">Suivi de commande</Link>
              <Link href="/legal/returns" className="hover:text-[#1A1A1A]/70 transition-colors">Retours</Link>
              <Link href="/faq" className="hover:text-[#1A1A1A]/70 transition-colors">FAQ</Link>
            </div>

            <div className="mt-4 text-[10px] text-[#1A1A1A]/40">
              © {new Date().getFullYear()} Nouamane Parfums. Revendeur autorisé au Maroc.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
