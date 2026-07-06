'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { MAIN_CATEGORIES } from '@/lib/products';
import SearchModal from './SearchModal';
import { useDictionary } from '@/context/DictionaryContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'shop' | 'brands' | null>(null);
  const { getItemCount } = useCart();
  const pathname = usePathname();
  const dict = useDictionary();
  const cartCount = getItemCount();

  const locale = pathname?.split('/')[1] || 'fr';
  const isHome = pathname === `/${locale}`;
  const alwaysLight = !isHome;

  const [brands, setBrands] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLight = alwaysLight || isScrolled;

  return (
    <>
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      onMouseLeave={() => setActiveMenu(null)}
      className={`fixed top-4 left-4 right-4 lg:top-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-[1200px] lg:max-w-[calc(100vw-3rem)] z-50 transition-all duration-500 bg-white/80 backdrop-blur-xl shadow-lg border border-white/50 ${isMobileMenuOpen ? 'rounded-3xl' : 'rounded-full'}`}
    >
      <div className="px-6 lg:px-10">
        <div className="flex items-center justify-between h-[60px] lg:h-[70px]">
          {/* LEFT NAV */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onMouseEnter={() => setActiveMenu('shop')}
              className={`text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 hover:text-[#0ea5e9] flex items-center gap-1 text-[#1A1A1A]/70`}
            >
              {dict.nav.shop || 'Boutique'} <ChevronDown size={12} />
            </button>
            <button
              onMouseEnter={() => setActiveMenu('brands')}
              className={`text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 hover:text-[#0ea5e9] flex items-center gap-1 text-[#1A1A1A]/70`}
            >
              {dict.nav.brands || 'Marques'} <ChevronDown size={12} />
            </button>
            <Link
              href="/suivi-commande"
              onMouseEnter={() => setActiveMenu(null)}
              className={`text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 hover:text-[#0ea5e9] text-[#1A1A1A]/70`}
            >
              {dict.nav.trackOrder || 'Suivi'}
            </Link>
          </nav>

          {/* LOGO */}
          <div className="flex-1 flex justify-center lg:flex-none lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <Link href={`/${locale}`} className="group flex flex-col items-center">
              <span
                className={`heading-font text-[22px] lg:text-[26px] font-light tracking-[0.28em] transition-colors duration-500 group-hover:text-[#0ea5e9] text-[#1A1A1A]`}
              >
                NOUAMANE
              </span>
              <span
                className={`text-[8px] font-semibold tracking-[0.35em] uppercase mt-[-2px] text-[#0ea5e9]`}
              >
                Parfums
              </span>
            </Link>
          </div>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-5 lg:gap-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`hidden lg:block hover:text-[#0ea5e9] transition-colors duration-300 text-[#1A1A1A]/60`}
              aria-label="Recherche"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.6} />
            </button>

            <Link
              href="/cart"
              className={`hover:text-[#0ea5e9] transition-colors duration-300 relative text-[#1A1A1A]/60`}
              aria-label="Panier"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.6} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#0ea5e9] text-white text-[9px] font-bold w-[16px] h-[16px] flex items-center justify-center rounded-full leading-none">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/suivi-commande"
              className={`hidden lg:block hover:text-[#0ea5e9] transition-colors duration-300 text-[#1A1A1A]/60`}
              aria-label="Compte"
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1.6} />
            </Link>

            <LanguageSwitcher />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden ${isLight ? 'text-[#1A1A1A]/80' : 'text-white'}`}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* MEGA MENU — Shop */}
      {activeMenu === 'shop' && (
        <div className="hidden lg:block absolute top-full left-0 right-0 glass border-t border-[#e0ddd4] shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
          <div className="max-w-[1400px] mx-auto px-10 py-10 grid grid-cols-3 gap-10">
            {MAIN_CATEGORIES.map((cat) => (
              <div key={cat.slug}>
                <Link
                  href={`/shop/${cat.slug}`}
                  className="heading-font text-2xl text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors block mb-4"
                >
                  {cat.label}
                </Link>
                <ul className="space-y-2.5">
                  {cat.subcategories.map((sc) => (
                    <li key={sc.slug}>
                      <Link
                        href={`/shop/${cat.slug}`}
                        className="text-[12px] text-[#6B6B6B] hover:text-[#0ea5e9] transition-colors"
                      >
                        {sc.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEGA MENU — Brands */}
      {activeMenu === 'brands' && (
        <div className="hidden lg:block absolute top-full left-0 right-0 glass border-t border-[#e0ddd4] shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
          <div className="max-w-[1400px] mx-auto px-10 py-10 grid grid-cols-3 gap-10">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group"
              >
                <div className="heading-font text-2xl text-[#1A1A1A] group-hover:text-[#0ea5e9] transition-colors mb-2">
                  {brand.label}
                </div>
                <Link href="/shop" className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">
                  Boutique
                </Link>
                <Link href="/blog" className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">
                  Le Blog
                </Link>
                <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A]/70 hover:text-[#0ea5e9] transition-colors">
                  Depuis {brand.founded} · {brand.origin}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-black/5 max-h-[calc(100vh-100px)] overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            <div>
              <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#9A9A9A] mb-3">Boutique</div>
              <div className="space-y-3 pl-2">
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-2xl heading-font text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors"
                >
                  Boutique
                </Link>
                {MAIN_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/shop/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[15px] font-medium text-[#1A1A1A] hover:text-[#0ea5e9]"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#9A9A9A] mb-3">Marques</div>
              <div className="space-y-3 pl-2">
                {brands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/brands/${brand.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[15px] font-medium text-[#1A1A1A] hover:text-[#0ea5e9]"
                  >
                    {brand.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-black/5 flex flex-col gap-5">
              <Link
                href="/suivi-commande"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-[14px] font-medium text-[#1A1A1A]"
              >
                <Package className="w-5 h-5 text-[#6B6B6B]" /> Suivi de commande
              </Link>
              <Link
                href="/suivi-commande"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-[14px] font-medium text-[#1A1A1A]"
              >
                <User className="w-5 h-5 text-[#6B6B6B]" /> Compte
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-[14px] font-medium text-[#1A1A1A]"
              >
                <ShoppingBag className="w-5 h-5 text-[#6B6B6B]" /> Panier ({cartCount})
              </Link>
            </div>
          </div>
        </div>
      )}

      </motion.header>

      {/* SEARCH MODAL */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
