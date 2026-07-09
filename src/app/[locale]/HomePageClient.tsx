'use client';

/**
 * HOMEPAGE — NOUAMANE Parfums
 * Featured products logic: Bestsellers · New Arrivals · Seasonal Trends
 * Positioning: Authorized designer perfume retailer in Morocco
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import BestsellersDirectory from '@/components/BestsellersDirectory';
import SplitTypographyHero from '@/components/SplitTypographyHero';
import FAQ from '@/components/FAQ';
import {
  ArrowRight,
  MoveRight,
  Star,
  Truck,
  ShieldCheck,
  Gift,
  BadgeCheck,
  Sparkles,
  Flame,
  Leaf,
} from 'lucide-react';
import {
  Product,
  getSeasonalTrends,
  MAIN_CATEGORIES,
} from '@/lib/products';

const fadeUpProps: any = {
  initial: { opacity: 0, y: 30, filter: 'blur(5px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.8, ease: 'easeOut' }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const staggerItem: any = {
  hidden: { opacity: 0, y: 30, filter: 'blur(5px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: 'easeOut' } }
};

export default function HomePageClient({ products, config, latestReviews = [] }: { products: Product[], config?: any, latestReviews?: any[] }) {
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';
  const newArrivals = [...products].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()).slice(0, 4);



  const currentMonth = new Date().getMonth();
  const isFallWinter = currentMonth >= 8 || currentMonth <= 1;
  const seasonalLabel = isFallWinter ? 'Tendances Automne-Hiver' : 'Tendances Printemps-Été';
  const seasonalSubtitle = isFallWinter
    ? 'Nos parfums chauds, épicés et enveloppants pour la saison froide.'
    : 'Nos fragrances fraîches, solaires et florales pour la belle saison.';

  const [brands, setBrands] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [homepageConfig, setHomepageConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(console.error);
      
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setBlogPosts(data);
      })
      .catch(console.error);

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setHomepageConfig(data))
      .catch(console.error);
  }, []);

  // Use admin-configured products if set, else fallback to tag-based
  const bestsellersDisplay = (() => {
    try {
      const slugs: string[] = JSON.parse(homepageConfig?.featuredBestsellers || '[]');
      if (slugs.length >= 1) return slugs.map(s => products.find(p => p.slug === s)).filter(Boolean) as typeof products;
    } catch {}
    const tagged = products.filter(p => p.tags.includes('bestseller'));
    return tagged.length >= 4 ? tagged.slice(0, 8) : products.slice(0, 8);
  })();

  const seasonalTrends = (() => {
    try {
      const slugs: string[] = JSON.parse(homepageConfig?.featuredSeasonal || '[]');
      if (slugs.length >= 1) return slugs.map(s => products.find(p => p.slug === s)).filter(Boolean) as typeof products;
    } catch {}
    const tagged = products.filter(p => p.tags.includes('seasonal-fall') || p.tags.includes('seasonal-spring'));
    return tagged.length >= 4 ? tagged.slice(0, 8) : products.filter(p => p.gender === 'women').slice(0, 8);
  })();

  return (
    <div className="bg-[#fafaf7] text-[#1A1A1A] overflow-x-hidden">
      <Header />

      {/* ===============================
          HERO (SPLIT TYPOGRAPHY)
          =============================== */}
      <SplitTypographyHero config={config} />
      {/* ===============================
          CATEGORY SHORTCUTS (Redesigned v2)
          =============================== */}
      <section className="relative w-full bg-white overflow-hidden">
        {/* Section title strip */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-20 lg:pt-28 pb-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#0ea5e9] mb-3 block">
                Nos collections
              </span>
              <h2 className="heading-font text-5xl lg:text-6xl tracking-wide text-[#1A1A1A]">
                Parcourir par <span className="italic text-[#9A9A9A]">Catégorie</span>
              </h2>
            </div>
            <div className="hidden lg:block h-[1px] flex-1 bg-gradient-to-r from-[#e0ddd4] to-transparent mb-4" />
          </div>
        </div>

        {/* Two-column horizontal cards */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 lg:pb-28">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
          >
            {MAIN_CATEGORIES.map((cat, index) => (
              <motion.div
                variants={staggerItem}
                key={cat.slug}
                className="group relative overflow-hidden rounded-2xl lg:rounded-3xl cursor-pointer"
                style={{ height: '480px' }}
              >
                <Link href={`/${locale}/shop/${cat.slug}`} className="block w-full h-full">
                  <Image
                    src={cat.heroImage}
                    alt={cat.label}
                    fill
                    className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                    priority={index === 0}
                  />
                  {/* Dark overlay - stronger at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#0ea5e9]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Number badge */}
                  <div className="absolute top-6 left-6">
                    <span className="heading-font text-[80px] lg:text-[120px] leading-none font-black text-white/10 group-hover:text-white/20 transition-all duration-700 select-none">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-8 lg:p-10 flex flex-col justify-end">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="heading-font text-4xl lg:text-6xl text-white tracking-wide mb-3">
                        {cat.labelShort}
                      </h3>
                      <p className="text-white/70 text-[13px] mb-5 line-clamp-2 max-w-xs">
                        {cat.description?.slice(0, 80)}...
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                      {cat.subcategories.slice(0, 4).map((sc) => (
                        <span
                          key={sc.slug}
                          className="text-[10px] font-bold tracking-[0.15em] uppercase bg-white text-[#1A1A1A] px-3 py-1.5 rounded-full"
                        >
                          {sc.label}
                        </span>
                      ))}
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase border border-white/50 text-white px-3 py-1.5 rounded-full flex items-center gap-1">
                        Explorer <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===============================
          FEATURED — BESTSELLERS
          =============================== */}
      <section className="relative bg-[#f8fafc] border-y border-[#e0ddd4] overflow-hidden py-24 lg:py-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-tr from-[#0ea5e9]/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-16 relative z-10">
          <SectionHeader
            icon={<Flame size={16} className="text-[#0ea5e9]" />}
            eyebrow="Les plus vendus au Maroc"
            title="Bestsellers"
            subtitle="Les fragrances plébiscitées par nos clients ce mois-ci."
            linkLabel="Voir tous les bestsellers"
            linkHref={`/${locale}/shop`}
          />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7"
          >
            {bestsellersDisplay.map((p) => (
              <motion.div variants={staggerItem} key={p.id}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===============================
          FEATURED — NEW ARRIVALS
          =============================== */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <SectionHeader
          icon={<Sparkles size={16} className="text-[#0ea5e9]" />}
          eyebrow="Nouveautés"
          title="Les dernières sorties"
          subtitle="Découvrez les nouvelles créations qui viennent d'arriver dans nos rayons."
          linkLabel="Voir toutes les nouveautés"
          linkHref={`/${locale}/shop`}
        />
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7"
        >
          {newArrivals.map((p) => (
            <motion.div variants={staggerItem} key={p.id}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===============================
          FEATURED — SEASONAL
          =============================== */}
      <section className="relative bg-[#1A1A1A] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Leaf size={14} className="text-[#0ea5e9]" />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#0ea5e9]">Édition saisonnière</span>
              </div>
              <h2 className="heading-font text-5xl lg:text-7xl text-white tracking-wide">
                {isFallWinter ? 'Tendances' : 'Tendances'}<br />
                <span className="text-[#9A9A9A] italic">{isFallWinter ? 'Automne-Hiver' : 'Printemps-Été'}</span>
              </h2>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-4">
              <p className="text-[#9A9A9A] text-[14px] max-w-xs text-left lg:text-right">{seasonalSubtitle}</p>
              <Link href={`/${locale}/shop`} className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-white border border-white/30 hover:bg-white hover:text-black transition-all px-6 py-3 rounded-full">
                Explorer la sélection <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7"
          >
            {seasonalTrends.map((p) => (
              <motion.div variants={staggerItem} key={p.id}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===============================
          BRAND SHOWCASE (5 Marques Mythiques)
          =============================== */}
      <section id="brands" className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
            L'Élite de la Parfumerie
          </span>
          <h2 className="heading-font text-5xl lg:text-6xl mt-4 tracking-wide">
            5 Marques Mythiques
          </h2>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row h-[900px] md:h-[700px] w-full gap-3 overflow-hidden group/accordion"
        >
          {[
            { name: 'Yves Saint Laurent', slug: 'yves-saint-laurent', logo: '/logos/ysl.png', img: 'https://images.pexels.com/photos/11216321/pexels-photo-11216321.jpeg?auto=compress&cs=tinysrgb&w=800' },
            { name: 'Valentino', slug: 'valentino', logo: '/logos/valentino.jpg', img: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800' },
            { name: 'Jean Paul Gaultier', slug: 'jean-paul-gaultier', logo: '/logos/jean-paul-gaultier.png', img: 'https://images.pexels.com/photos/1961791/pexels-photo-1961791.jpeg?auto=compress&cs=tinysrgb&w=800' },
            { name: 'Dior', slug: 'dior', logo: '/logos/dior.jpeg', img: 'https://images.pexels.com/photos/432059/pexels-photo-432059.jpeg?auto=compress&cs=tinysrgb&w=800' },
            { name: 'Giorgio Armani', slug: 'armani', logo: '/logos/armani.png', img: 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=800' }
          ].map((brand) => (
            <motion.div 
              variants={staggerItem} 
              key={brand.slug} 
              className="brand-slice group relative flex-1 md:hover:flex-[4] transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-3xl cursor-pointer"
            >
              <Link href={`/${locale}/brands/${brand.slug}`} className="block w-full h-full bg-white relative">
                <Image
                  src={brand.img}
                  alt={brand.name}
                  fill
                  className="object-cover brightness-[0.4] group-hover:brightness-[0.9] transition-all duration-[1.5s] scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                {/* Vertical Text (Collapsed state on desktop) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 md:opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none">
                  <span className="heading-font text-white text-3xl -rotate-90 whitespace-nowrap tracking-widest">{brand.name}</span>
                </div>

                {/* Content shown on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none transform translate-y-8 group-hover:translate-y-0 z-10">
                  <div className="w-48 h-48 bg-white/95 rounded-full flex items-center justify-center p-6 shadow-2xl mb-8 transform scale-90 group-hover:scale-100 transition-transform duration-700 backdrop-blur-sm border border-white/50 overflow-hidden">
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      width={160}
                      height={160}
                      className="object-contain w-full h-full mix-blend-multiply"
                    />
                  </div>
                  <span className="text-[12px] font-bold tracking-[0.3em] uppercase text-white bg-black/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                    Découvrir {brand.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===============================
          VALUE PROPOSITIONS
          =============================== */}
      <section className="bg-[#f8fafc] text-[#1A1A1A]">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
        >
          {[
            { icon: <BadgeCheck size={22} strokeWidth={1.5} />, title: '100% Authentiques', desc: 'Nos parfums proviennent directement des distributeurs officiels de chaque maison. Facture d\'origine sur demande.' },
            { icon: <Truck size={22} strokeWidth={1.5} />, title: 'Livraison 35Dh', desc: 'Livraison partout au Maroc avec 35Dh en 24-48h. Suivi par SMS et WhatsApp inclus.' },
            { icon: <ShieldCheck size={22} strokeWidth={1.5} />, title: 'Paiement à la livraison', desc: 'Payez en toute sérénité à la réception. Aucun risque, aucune surprise.' },
            { icon: <Star size={22} strokeWidth={1.5} />, title: 'Authenticité garantie', desc: 'Tous nos parfums sont 100% originaux et certifiés authentiques.' },
          ].map((item) => (
            <motion.div variants={staggerItem} key={item.title} className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#0ea5e9]/40 text-[#0ea5e9] mb-4">
                {item.icon}
              </div>
              <h3 className="heading-font text-xl tracking-wide mb-2 text-[#1A1A1A]">{item.title}</h3>
              <p className="text-[13px] text-[#1A1A1A]/70 leading-[1.7]">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===============================
          TESTIMONIALS (AVIS CLIENTS) — Redesigned
          =============================== */}
      <section className="relative bg-[#0D0D0D] overflow-hidden py-28 lg:py-40">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0ea5e9]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0ea5e9]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-20 gap-8"
          >
            <div>
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#0ea5e9] mb-6 block">
                Ils nous font confiance
              </span>
              <h2 className="heading-font text-5xl lg:text-8xl text-white tracking-wide leading-none">
                Avis de<br /><span className="text-[#9A9A9A] italic">nos clients</span>
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="heading-font text-5xl text-white">4.9</div>
                <div className="flex gap-1 justify-center mt-2">
                  {[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-[#0ea5e9] fill-[#0ea5e9]" />)}
                </div>
                <div className="text-[11px] text-[#9A9A9A] mt-1">Note moyenne</div>
              </div>
              <div className="w-[1px] h-16 bg-white/10" />
              <div className="text-center">
                <div className="heading-font text-5xl text-white">500+</div>
                <div className="text-[11px] text-[#9A9A9A] mt-1">Clients satisfaits</div>
              </div>
            </div>
          </motion.div>

          {/* Reviews grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {(latestReviews && latestReviews.length > 0 ? latestReviews : [
              { comment: "C'est la 3ème fois kanakhd mn 3andkom. Service top w la livraison sur Casablanca kant f 24h. Le parfum Amouage rah 100% original w chadda fih ri7a mzyan!", author: "Yassir B.", city: "Casablanca", product: { name: "Amouage Interlude Man" }, rating: 5 },
              { comment: "Franchement j'avais des doutes, mais sda9 site sadi9. Khdit Baccarat Rouge tester, c'est l'original. Tbarkallah 3likom, bonne continuation.", author: "Mounia T.", city: "Marrakech", product: { name: "Baccarat Rouge 540" }, rating: 5 },
              { comment: "Service client f lmostawa. 3awnoni n3zal parfum li bghit. La livraison l Tanger kant rapide w l'emballage n9i. Recommandé à 100%!", author: "Ayoub R.", city: "Tanger", product: { name: "Armani Stronger With You" }, rating: 5 },
              { comment: "J'étais fatigué d'acheter des parfums chez des revendeurs douteux. La garantie d'authenticité et la livraison rapide de Nouamane font toute la différence. Stronger With You est parfait!", author: "Hassan L.", city: "Casablanca", product: { name: "Armani Stronger With You" }, rating: 5 },
              { comment: "Expérience incroyable. Le parfum est arrivé dans un emballage soigné en moins de 48h. L'odeur est 100% authentique. Je recommande à tous mes proches.", author: "Salma B.", city: "Rabat", product: { name: "YSL Libre Eau de Parfum" }, rating: 5 },
              { comment: "Un service client exceptionnel et un choix incroyable des plus grandes maisons de luxe. C'est de loin ma meilleure expérience d'achat de parfum au Maroc.", author: "Youssef E.", city: "Tanger", product: { name: "Valentino Uomo Intense" }, rating: 5 },
            ]).map((review: any, i: number) => (
              <motion.div
                variants={staggerItem}
                key={review.id || i}
                className={`relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 flex flex-col justify-between ${
                  i === 1 ? 'lg:mt-12' : i === 3 ? 'lg:mt-8' : i === 5 ? 'lg:mt-16' : ''
                }`}
              >
                {/* Quote mark */}
                <div className="absolute top-6 right-8 text-[80px] leading-none text-white/5 font-serif select-none">"</div>
                
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={13} className="text-[#0ea5e9] fill-[#0ea5e9]" />
                    ))}
                  </div>
                  <blockquote className="text-[15px] text-white/80 leading-[1.9] mb-8">
                    {review.comment}
                  </blockquote>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <div>
                    <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-white">
                      {review.author}
                    </div>
                    <div className="text-[11px] text-[#9A9A9A] mt-1">
                      Client vérifié · {review.city}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#0ea5e9] font-bold tracking-wide text-right max-w-[120px]">
                    {review.product?.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-16 flex justify-center">
            <Link href={`/${locale}/shop`} className="text-white border border-white/30 hover:bg-white hover:text-black transition-all px-8 py-4 rounded-full text-[12px] font-bold tracking-[0.15em] uppercase text-center inline-flex items-center gap-2">
              Vous avez acheté chez nous ? Laissez un avis ! <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <FAQ />

      <Footer />
      <CartDrawer />
    </div>
  );
}

/* ============================================================
   SECTION HEADER — reusable
   ============================================================ */
function SectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  linkLabel,
  linkHref,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  linkLabel: string;
  linkHref: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20, filter: 'blur(3px)' }}
      whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
            {eyebrow}
          </span>
        </div>
        <h2 className="heading-font text-4xl lg:text-5xl tracking-wide">{title}</h2>
        <p className="mt-3 text-[14px] text-[#6B6B6B] max-w-lg">{subtitle}</p>
      </div>
      <Link
        href={linkHref}
        className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#0ea5e9] transition-colors group self-start"
      >
        {linkLabel}
        <span className="block w-8 h-px bg-[#6B6B6B] group-hover:bg-[#0ea5e9] transition-colors" />
      </Link>
    </motion.div>
  );
}
