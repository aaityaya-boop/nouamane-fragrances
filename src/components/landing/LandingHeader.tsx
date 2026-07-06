'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex flex-col items-center">
          <span className="heading-font text-xl lg:text-2xl font-light tracking-[0.25em] text-[#1A1A1A]">
            NOUAMANE
          </span>
          <span className="text-[7px] lg:text-[8px] font-semibold tracking-[0.3em] uppercase mt-[-2px] text-[#0ea5e9]">
            Parfums
          </span>
        </Link>

        {/* SECURITY BADGES (Helps conversion) */}
        <div className="flex items-center gap-4 text-[10px] lg:text-[11px] font-bold tracking-[0.1em] text-gray-500 uppercase">
          <div className="flex items-center gap-1.5">
            <span className="text-[#0ea5e9] text-sm">✓</span>
            100% Authentique
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[#0ea5e9] text-sm">✓</span>
            Paiement à la livraison
          </div>
        </div>
      </div>
    </header>
  );
}
