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

export default function HomePageClient({ products, config }: { products: Product[], config?: any }) {
  const { scrollY } = useScroll();

  const bestsellers = products.filter((p) => p.tags.includes('bestseller')).slice(0, 4);
  const newArrivals = [...products].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()).slice(0, 4);
  const seasonalTrends = products.filter((p) => p.tags.includes('seasonal-fall') || p.tags.includes('seasonal-spring')).slice(0, 4);

  const currentMonth = new Date().getMonth();
  const isFallWinter = currentMonth >= 8 || currentMonth <= 1;
  const seasonalLabel = isFallWinter ? 'Tendances Automne-Hiver' : 'Tendances Printemps-Été';
  const seasonalSubtitle = isFallWinter
    ? 'Nos parfums chauds, épicés et enveloppants pour la saison froide.'
    : 'Nos fragrances fraîches, solaires et florales pour la belle saison.';

  const [brands, setBrands] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

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
  }, []);

  return (
    <div className="bg-[#fafaf7] text-[#1A1A1A] overflow-x-hidden">
      <Header />

      {/* ===============================
          HERO (SPLIT TYPOGRAPHY)
          =============================== */}
      <SplitTypographyHero config={config} />

      {/* ===============================
          BRAND SHOWCASE
          =============================== */}
      <section id="brands" className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
            Les Grandes Maisons
          </span>
          <h2 className="heading-font text-4xl lg:text-5xl mt-2 tracking-wide">
            5 marques mythiques
          </h2>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row h-[800px] md:h-[600px] w-full gap-2 lg:gap-4 overflow-hidden group/accordion"
        >
          {brands.slice(0, 5).map((brand) => (
            <motion.div 
              variants={staggerItem} 
              key={brand.slug} 
              className="brand-slice group relative flex-1 md:hover:flex-[4] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer"
            >
              <Link href={`/brands/${brand.slug}`} className="block w-full h-full">
                <Image
                  src={brand.image || 'https://images.pexels.com/photos/11216321/pexels-photo-11216321.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600'}
                  alt={brand.label || brand.name}
                  fill
                  className="object-cover brightness-[0.6] md:brightness-[0.4] group-hover:brightness-[0.8] transition-all duration-700 scale-105 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Vertical Text (Collapsed state on desktop) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 md:opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                  <span className="heading-font text-white text-3xl -rotate-90 whitespace-nowrap tracking-widest">{brand.label || brand.name}</span>
                </div>

                {/* Expanded Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-700 md:translate-y-4 md:group-hover:translate-y-0">
                  <div className="heading-font text-3xl lg:text-5xl text-white mt-2 tracking-wide leading-tight whitespace-nowrap">
                    {brand.label || brand.name}
                  </div>
                  <div className="mt-3 text-white/80 text-[14px] italic max-w-sm line-clamp-2">
                    {brand.description}
                  </div>
                  <div className="mt-6 inline-flex items-center justify-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-white hover:bg-white hover:text-black transition-colors">
                    Explorer la collection
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===============================
          FEATURED — BESTSELLERS
          =============================== */}
      <section className="relative bg-[#f8fafc] border-y border-[#e0ddd4] overflow-hidden py-24 lg:py-32">
        {/* Massive Radial Spotlight Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#0ea5e9]/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-16 relative z-10">
          <SectionHeader
            icon={<Flame size={16} className="text-[#0ea5e9]" />}
            eyebrow="Les plus vendus au Maroc"
            title="Bestsellers"
            subtitle="Les fragrances plébiscitées par nos clients ce mois-ci."
            linkLabel="Voir tous les bestsellers"
            linkHref="/shop"
          />
        </div>

        {/* Brutalist Directory */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <BestsellersDirectory products={bestsellers.slice(0, 4)} />
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
          linkHref="/shop"
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
      <section className="bg-transparent border-y border-[#e0ddd4]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <SectionHeader
            icon={<Leaf size={16} className="text-[#0ea5e9]" />}
            eyebrow="Édition saisonnière"
            title={seasonalLabel}
            subtitle={seasonalSubtitle}
            linkLabel="Explorer la sélection"
            linkHref="/shop"
          />
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
          CATEGORY SHORTCUTS
          =============================== */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
            Trouvez votre style
          </span>
          <h2 className="heading-font text-4xl lg:text-5xl mt-2 tracking-wide">
            Parcourir par catégorie
          </h2>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {MAIN_CATEGORIES.map((cat) => (
            <motion.div variants={staggerItem} key={cat.slug} className="h-full">
              <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className="group block w-full relative h-[320px] rounded-2xl overflow-hidden border border-[#e0ddd4]"
            >
              <Image
                src={cat.heroImage}
                alt={cat.label}
                fill
                className="object-cover brightness-[0.6] group-hover:brightness-75 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#38bdf8] mb-3">
                  Collection
                </div>
                <div className="heading-font text-4xl lg:text-5xl text-white tracking-wide">
                  {cat.labelShort}
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {cat.subcategories.slice(0, 4).map((sc) => (
                    <span
                      key={sc.slug}
                      className="text-[9px] font-semibold tracking-[0.15em] uppercase bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/30"
                    >
                      {sc.label}
                    </span>
                  ))}
                </div>
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
          TESTIMONIALS (AVIS CLIENTS)
          =============================== */}
      <motion.section {...fadeUpProps} className="bg-[#f8fafc] border-y border-[#e0ddd4] py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
              Ce qu'ils en pensent
            </span>
            <h2 className="heading-font text-4xl lg:text-5xl mt-2 tracking-wide">
              Avis de nos clients
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "J'étais fatigué d'acheter des parfums chez des revendeurs douteux. La garantie d'authenticité et la livraison rapide de Nouamane font toute la différence. Stronger With You est parfait !",
                author: "Hassan L.",
                city: "Casablanca",
                product: "Armani Stronger With You"
              },
              {
                text: "Expérience incroyable. Le parfum est arrivé dans un emballage soigné en moins de 48h. L'odeur est 100% authentique. Je recommande à tous mes proches.",
                author: "Salma B.",
                city: "Rabat",
                product: "YSL Libre Eau de Parfum"
              },
              {
                text: "Un service client exceptionnel et un choix incroyable des plus grandes maisons de luxe. C'est de loin ma meilleure expérience d'achat de parfum au Maroc.",
                author: "Youssef E.",
                city: "Tanger",
                product: "Valentino Uomo Intense"
              }
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-[#e0ddd4] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className="text-[#0ea5e9] fill-[#0ea5e9]" />
                    ))}
                  </div>
                  <blockquote className="text-[14px] text-[#6B6B6B] leading-[1.8] italic mb-8">
                    "{review.text}"
                  </blockquote>
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A]">
                    {review.author}
                  </div>
                  <div className="text-[11px] text-[#9A9A9A] mt-1">
                    Client vérifié · {review.city}
                  </div>
                  <div className="text-[10px] text-[#0ea5e9] mt-2 font-semibold">
                    Achat: {review.product}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

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
