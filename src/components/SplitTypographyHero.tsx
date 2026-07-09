'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function SplitTypographyHero({ config }: { config?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacityText = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

  const heroTitle = config?.heroTitle || "L'Essence\nde l'Élégance";
  const heroSubtitle = config?.heroSubtitle || "Découvrez une collection de parfums de luxe, sélectionnée avec soin pour laisser une empreinte inoubliable.";

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#0D0D0D]">
      {/* 1. BACKGROUND IMAGE PARALLAX */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: yBackground }}
      >
        <motion.div 
          className="relative w-full h-full"
          animate={{ scale: [1, 1.05] }}
          transition={{ duration: 25, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
        >
          <Image
            src="https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="Parfum de luxe"
            fill
            priority
            className="object-cover object-[center_30%]"
          />
          {/* Refined gradient overlays for maximum luxury feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-80" />
        </motion.div>
      </motion.div>

      {/* 2. MAIN CONTENT (LEFT ALIGNED EDITORIAL) */}
      <motion.div 
        className="relative z-20 h-full max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col justify-center pb-10"
        style={{ opacity: opacityText, y: yText }}
      >
        <div className="max-w-4xl mt-20">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex items-center gap-4 mb-8 sm:mb-12"
          >
            <span className="w-12 h-[1px] bg-[#0ea5e9]/70" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.4em] uppercase text-[#0ea5e9]">
              Maison de Haute Parfumerie
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="heading-font text-5xl sm:text-7xl md:text-8xl lg:text-[110px] text-white tracking-wide leading-[1.05] mb-10 sm:mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="overflow-hidden"
            >
              L'Essence
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
              className="flex items-center gap-4 sm:gap-6 mt-2"
            >
              <span className="text-3xl sm:text-5xl lg:text-7xl font-serif text-[#0ea5e9]/60 italic font-light">&</span>
              <span className="text-[#e0ddd4]">de l'Élégance</span>
            </motion.div>
          </h1>

          {/* Subtitle & CTA in a sophisticated layout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:gap-16 pl-0 sm:pl-16 border-l border-transparent sm:border-white/10"
          >
            <p className="text-[14px] md:text-[16px] text-[#9A9A9A] font-light max-w-[320px] leading-[1.9] tracking-wide">
              {heroSubtitle}
            </p>
            <Link
              href={`/${locale}/shop`}
              className="group relative inline-flex items-center justify-center overflow-hidden border border-[#e0ddd4]/20 bg-white/5 backdrop-blur-sm px-12 py-5 transition-all duration-700 hover:bg-white hover:border-white"
            >
              <span className="relative z-10 text-[10px] font-bold tracking-[0.3em] uppercase text-white transition-colors duration-500 group-hover:text-black">
                Découvrir
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 3. FLOATING GLASS CARD (RIGHT SIDE) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
        style={{ opacity: opacityText, y: yText }}
        className="absolute bottom-24 right-6 lg:right-12 z-20 hidden lg:flex flex-col gap-6"
      >
        <div className="bg-[#0D0D0D]/40 backdrop-blur-xl border border-white/10 p-10 w-[360px]">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full animate-pulse" />
            <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/60">
              L'Art du Parfum
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4 group">
              <span className="text-white/50 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors group-hover:text-white/80">Authenticité</span>
              <span className="heading-font text-3xl text-white group-hover:text-[#0ea5e9] transition-colors">100%</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/10 pb-4 group">
              <span className="text-white/50 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors group-hover:text-white/80">Livraison</span>
              <span className="heading-font text-3xl text-white group-hover:text-[#0ea5e9] transition-colors">24H</span>
            </div>
            <div className="flex justify-between items-end group">
              <span className="text-white/50 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors group-hover:text-white/80">Clients</span>
              <span className="heading-font text-3xl text-white group-hover:text-[#0ea5e9] transition-colors">500+</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        style={{ opacity: opacityText }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
      >
        <div className="w-[1px] h-16 bg-white/10 overflow-hidden relative">
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute top-0 bottom-0 left-0 right-0 bg-white"
          />
        </div>
        <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-white/40">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
