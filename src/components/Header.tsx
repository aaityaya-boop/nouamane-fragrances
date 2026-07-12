'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Package, ChevronRight, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { MAIN_CATEGORIES } from '@/lib/products';
import SearchModal from './SearchModal';
import { useDictionary } from '@/context/DictionaryContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'women' | 'men' | 'unisex' | 'brands' | 'bundles' | null>(null);
  const { getItemCount } = useCart();
  const pathname = usePathname();
  const dict = useDictionary();
  const cartCount = getItemCount();

  const locale = pathname?.split('/')[1] || 'fr';
  const isHome = pathname === `/${locale}`;

  const [brands, setBrands] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine if header should be solid white
  const isSolid = !isHome || isScrolled || activeMenu !== null || isMobileMenuOpen;

  return (
    <>
      <header
        onMouseLeave={() => setActiveMenu(null)}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isSolid ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-[#e0ddd4]/60' : 'bg-transparent'
        }`}
      >

        

        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[60px] lg:h-[75px]">
            {/* LEFT NAV (Desktop) */}
            <nav className="hidden lg:flex items-center gap-8 w-1/3">
              {['women', 'men', 'brands', 'bundles'].map((menuKey) => {
                const labels: any = { women: 'Femme', men: 'Homme', brands: 'Marques', bundles: 'Coffrets Cadeaux' };
                return (
                  <div 
                    key={menuKey} 
                    className="h-full flex items-center"
                    onMouseEnter={() => setActiveMenu(menuKey as any)}
                  >
                    <button
                      className={`text-[11px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 flex items-center gap-1.5 h-[75px] border-b-2 ${
                        activeMenu === menuKey ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent ' + (isSolid ? 'text-[#1A1A1A]' : 'text-white hover:text-white/80')
                      }`}
                    >
                      {labels[menuKey]}
                      {menuKey === 'bundles' && (
                        <span className="bg-[#D4AF37] text-white text-[8px] px-1.5 py-0.5 rounded-sm tracking-wider luxury-pulse flex-shrink-0">
                          Nouveau
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </nav>

            {/* LOGO */}
            <div className="w-1/3 flex justify-center">
              <Link href={`/${locale}`} className="group flex flex-col items-center">
                <span
                  className={`heading-font text-[24px] lg:text-[28px] font-light tracking-[0.25em] transition-colors duration-300 group-hover:text-[#0ea5e9] ${
                    isSolid ? 'text-[#1A1A1A]' : 'text-white'
                  }`}
                >
                  NOUAMANE
                </span>
                <span
                  className={`text-[8px] font-semibold tracking-[0.35em] uppercase mt-[-2px] ${
                    isSolid ? 'text-[#0ea5e9]' : 'text-white/80'
                  }`}
                >
                  Parfums
                </span>
              </Link>
            </div>

            {/* RIGHT ICONS */}
            <div className="w-1/3 flex items-center justify-end gap-5 lg:gap-6">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`hidden lg:block transition-colors duration-300 ${
                  isSolid ? 'text-[#1A1A1A] hover:text-[#0ea5e9]' : 'text-white hover:text-white/80'
                }`}
                aria-label="Recherche"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>

              <Link
                id="header-cart-icon"
                href={`/${locale}/cart`}
                className={`transition-colors duration-300 relative ${
                  isSolid ? 'text-[#1A1A1A] hover:text-[#0ea5e9]' : 'text-white hover:text-white/80'
                }`}
                aria-label="Panier"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#0ea5e9] text-white text-[9px] font-bold w-[16px] h-[16px] flex items-center justify-center rounded-full leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                href={`/${locale}/account`}
                className={`hidden lg:block transition-colors duration-300 ${
                  isSolid ? 'text-[#1A1A1A] hover:text-[#0ea5e9]' : 'text-white hover:text-white/80'
                }`}
                aria-label="Compte"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>

              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden ${isSolid ? 'text-[#1A1A1A]' : 'text-white'}`}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MEGA MENUS DESKTOP */}
        {/* ============================================================== */}
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block absolute top-[60px] lg:top-[75px] left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-t border-[#e0ddd4]/60"
            >
              <div 
                className="max-w-[1400px] mx-auto px-10 py-10 flex gap-16 overflow-y-auto lux-scrollbar overscroll-contain"
                style={{ maxHeight: 'calc(100vh - 100px)' }}
              >
                
                {/* --- WOMEN MEGA MENU --- */}
                {activeMenu === 'women' && (
                  <>
                    <div className="flex-1 grid grid-cols-3 gap-12">
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-5">Familles Olfactives</div>
                        <ul className="space-y-4">
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/women?sub=floral`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Parfums Floraux</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/women?sub=oriental`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Parfums Orientaux</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/women?sub=woody`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Parfums Boisés</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/women?sub=fresh`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Parfums Frais</Link></li>
                          <li className="pt-2"><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/women`} className="text-[11px] font-bold uppercase tracking-wider text-[#0ea5e9] flex items-center gap-1">Tout voir <ChevronRight size={14}/></Link></li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-5">Découverte</div>
                        <ul className="space-y-4">
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/women`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors flex items-center gap-2">Testeurs Originaux </Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/women`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Meilleures Ventes</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/women`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Nouveautés</Link></li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-5">Marques Phares</div>
                        <ul className="space-y-4">
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/brands/yves-saint-laurent`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Yves Saint Laurent</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/brands/valentino`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Valentino</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/brands/armani`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Giorgio Armani</Link></li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}

                {/* --- MEN MEGA MENU --- */}
                {activeMenu === 'men' && (
                  <>
                    <div className="flex-1 grid grid-cols-3 gap-12">
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-5">Familles Olfactives</div>
                        <ul className="space-y-4">
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/men?sub=woody`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Parfums Boisés</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/men?sub=oriental`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Parfums Orientaux</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/men?sub=aromatic`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Parfums Aromatiques</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/men?sub=fresh`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Parfums Frais</Link></li>
                          <li className="pt-2"><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/men`} className="text-[11px] font-bold uppercase tracking-wider text-[#0ea5e9] flex items-center gap-1">Tout voir <ChevronRight size={14}/></Link></li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-5">Découverte</div>
                        <ul className="space-y-4">
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/men`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors flex items-center gap-2">Testeurs Originaux </Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/men`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Meilleures Ventes</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/shop/men`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Nouveautés</Link></li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-5">Marques Phares</div>
                        <ul className="space-y-4">
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/brands/armani`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Giorgio Armani</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/brands/yves-saint-laurent`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Yves Saint Laurent</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href={`/${locale}/brands/valentino`} className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Valentino</Link></li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}

                {/* --- UNISEX & COFFRETS MEGA MENU --- */}
                {activeMenu === 'unisex' && (
                  <>
                    <div className="flex-1 grid grid-cols-2 gap-12">
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-5">Idées Cadeaux</div>
                        <ul className="space-y-4">
                          <li><Link onClick={() => setActiveMenu(null)} href="/shop/unisex?sub=gift-bundles" className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Coffrets Cadeaux</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href="/shop/unisex?sub=discovery-sets" className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Coffrets Découverte</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href="/shop/unisex?sub=limited-editions" className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Éditions Limitées</Link></li>
                          <li className="pt-2"><Link onClick={() => setActiveMenu(null)} href="/shop/unisex" className="text-[11px] font-bold uppercase tracking-wider text-[#0ea5e9] flex items-center gap-1">Tout voir <ChevronRight size={14}/></Link></li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-5">Parfums de niche / Unisexe</div>
                        <ul className="space-y-4">
                          <li><Link onClick={() => setActiveMenu(null)} href="/shop/unisex" className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Collection Privée Armani</Link></li>
                          <li><Link onClick={() => setActiveMenu(null)} href="/shop/unisex" className="text-[13px] text-[#1A1A1A] hover:text-[#0ea5e9] transition-colors">Le Vestiaire des Parfums YSL</Link></li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}

                {/* --- BRANDS MEGA MENU --- */}
                {activeMenu === 'brands' && (
                  <div className="w-full">
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-6">Toutes Nos Maisons</div>
                    <div className="grid grid-cols-4 gap-6">
                      {brands.map((brand) => (
                        <Link
                          key={brand.slug}
                          href={`/${locale}/brands/${brand.slug}`}
                          onClick={() => setActiveMenu(null)}
                          className="group border border-[#e0ddd4] bg-white rounded-xl overflow-hidden hover:border-[#0ea5e9] transition-all hover:shadow-lg flex flex-col"
                        >
                          <div className="relative h-24 w-full flex items-center justify-center p-6">
                            <Image 
                              src={`/images/brands/${brand.slug}-logo.jpg`} 
                              alt={brand.name} 
                              fill
                              sizes="(max-width: 768px) 100vw, 200px"
                              className="object-contain p-4 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 mix-blend-multiply" 
                            />
                          </div>
                          <div className="p-3 bg-[#f8fafc] flex justify-between items-center border-t border-[#e0ddd4] mt-auto">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] group-hover:text-[#0ea5e9] transition-colors line-clamp-1">{brand.label}</span>
                            <ChevronRight size={14} className="text-[#9A9A9A] group-hover:text-[#0ea5e9] transition-colors flex-shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* --- BUNDLES MEGA MENU --- */}
                {activeMenu === 'bundles' && (
                  <div className="w-full flex-1">
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-6">Nos Éditions Spéciales</div>
                    <div className="grid grid-cols-2 gap-12">
                      {/* Pack Jour & Nuit */}
                      <Link href={`/${locale}/shop`} onClick={() => setActiveMenu(null)} className="group cursor-pointer flex gap-8 items-center bg-[#f8fafc] border border-[#e0ddd4] p-6 rounded-xl hover:border-[#D4AF37] hover:shadow-lg transition-all">
                        <div className="relative w-32 h-40 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-[#e0ddd4]">
                          <div className="absolute inset-0 bg-[#f9f9f9] group-hover:bg-transparent transition-colors z-10" />
                          <div className="absolute inset-0 flex items-center justify-center text-[#d4d4d4] p-4 text-center text-xs font-serif italic">
                            Pack Jour & Nuit
                          </div>
                        </div>
                        <div>
                          <h3 className="heading-font text-2xl text-[#1A1A1A] mb-2 group-hover:text-[#D4AF37] transition-colors">Pack Jour & Nuit</h3>
                          <p className="text-[13px] text-[#9A9A9A] mb-5 leading-relaxed">
                            La combinaison parfaite pour vous accompagner tout au long de votre journée et de vos soirées les plus prestigieuses.
                          </p>
                          <span className="btn-blue text-[11px] px-6 py-2.5 rounded-full inline-block group-hover:bg-[#D4AF37] group-hover:text-white">
                            Découvrir
                          </span>
                        </div>
                      </Link>

                      {/* Pack Découverte */}
                      <Link href={`/${locale}/shop`} onClick={() => setActiveMenu(null)} className="group cursor-pointer flex gap-8 items-center bg-[#f8fafc] border border-[#e0ddd4] p-6 rounded-xl hover:border-[#D4AF37] hover:shadow-lg transition-all">
                        <div className="relative w-32 h-40 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-[#e0ddd4]">
                          <div className="absolute inset-0 bg-[#f9f9f9] group-hover:bg-transparent transition-colors z-10" />
                          <div className="absolute inset-0 flex items-center justify-center text-[#d4d4d4] p-4 text-center text-xs font-serif italic">
                            Pack Découverte
                          </div>
                        </div>
                        <div>
                          <h3 className="heading-font text-2xl text-[#1A1A1A] mb-2 group-hover:text-[#D4AF37] transition-colors">Pack Découverte</h3>
                          <p className="text-[13px] text-[#9A9A9A] mb-5 leading-relaxed">
                            Explorez nos fragrances signatures à travers ce coffret découverte exclusif, idéal pour un cadeau inoubliable.
                          </p>
                          <span className="btn-blue text-[11px] px-6 py-2.5 rounded-full inline-block group-hover:bg-[#D4AF37] group-hover:text-white">
                            Découvrir
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
                
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-[#e0ddd4] overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 60px)' }}
            >
              <div className="px-6 py-8 space-y-8">
                {/* Mobile Categories */}
                <div className="space-y-6">
                  {MAIN_CATEGORIES.map((cat) => (
                    <div key={cat.slug} className="border-b border-[#e0ddd4] pb-6 last:border-0 last:pb-0">
                      <Link 
                        href={`/${locale}/shop/${cat.slug}`} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="heading-font text-2xl text-[#1A1A1A] block mb-4"
                      >
                        {cat.label}
                      </Link>
                      <div className="grid grid-cols-2 gap-3 pl-2">
                        {cat.subcategories.map(sub => (
                          <Link 
                            key={sub.slug}
                            href={`/${locale}/shop/${cat.slug}?sub=${sub.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-[14px] text-[#6B6B6B]"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="border-b border-[#e0ddd4] pb-6">
                    <div className="heading-font text-2xl text-[#1A1A1A] block mb-4">Marques</div>
                    <div className="grid grid-cols-2 gap-3 pl-2">
                      {brands.map(brand => (
                        <Link 
                          key={brand.slug}
                          href={`/${locale}/brands/${brand.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex flex-col items-center justify-center border border-[#e0ddd4] bg-[#f8fafc] rounded-lg p-3 hover:border-[#0ea5e9] transition-colors"
                        >
                          <div className="relative w-full h-10 mb-2">
                            <Image 
                              src={`/images/brands/${brand.slug}-logo.jpg`} 
                              alt={brand.name} 
                              fill
                              sizes="(max-width: 768px) 50vw, 100px"
                              className="object-contain mix-blend-multiply grayscale opacity-70" 
                            />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] text-center line-clamp-1">{brand.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-[#e0ddd4] pb-6">
                    <Link 
                      href={`/${locale}/shop`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="heading-font text-2xl text-[#1A1A1A] flex items-center gap-3 mb-2"
                    >
                      Coffrets Cadeaux
                      <span className="bg-[#D4AF37] text-white text-[9px] px-2 py-0.5 rounded tracking-wider luxury-pulse font-sans">
                        Nouveau
                      </span>
                    </Link>
                    <p className="text-[13px] text-[#9A9A9A]">Découvrez nos packs exclusifs (Jour & Nuit, Découverte...)</p>
                  </div>
                </div>

                {/* Mobile Footer Nav */}
                <div className="pt-6 border-t border-[#e0ddd4] flex flex-col gap-5">
                  <Link
                    href={`/${locale}/suivi-commande`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-[15px] font-medium text-[#1A1A1A]"
                  >
                    <Package className="w-5 h-5 text-[#6B6B6B]" /> Suivi de commande
                  </Link>
                  <Link
                    href={`/${locale}/account`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-[15px] font-medium text-[#1A1A1A]"
                  >
                    <User className="w-5 h-5 text-[#6B6B6B]" /> Mon Compte
                  </Link>
                  <Link
                    href={`/${locale}/cart`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-[15px] font-medium text-[#1A1A1A]"
                  >
                    <ShoppingBag className="w-5 h-5 text-[#6B6B6B]" /> Mon Panier ({cartCount})
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>

      {/* SEARCH MODAL */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
