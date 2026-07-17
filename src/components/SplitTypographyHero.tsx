'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SplitTypographyHero({ config }: { config?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Pro Scroll Effects (Minimalist & Luxury)
  const opacityContent = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scaleContent = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const yContent = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const filterBlur = useTransform(scrollYProgress, [0, 0.8], ['blur(0px)', 'blur(12px)']);
  
  // Parallax Split Effect on Scroll
  const xLeft = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const xRight = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  
  const yAura = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full bg-[#FCFCFC] overflow-hidden flex items-center justify-center selection:bg-[#111] selection:text-white"
    >
      {/* CSS for Liquid Glass Effect - KEPT EXACTLY AS REQUESTED */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes liquid-glace {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .liquid-glace-text {
          background: linear-gradient(
            110deg,
            #111111 10%,
            #0ea5e9 30%,
            #ffffff 45%,
            #e0f2fe 50%,
            #0ea5e9 55%,
            #111111 75%
          );
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: liquid-glace 8s linear infinite;
          filter: drop-shadow(0px 2px 4px rgba(14,165,233,0.15));
        }
        .liquid-glace-mask {
          background: linear-gradient(
            110deg,
            #111111 10%,
            #0ea5e9 30%,
            #ffffff 45%,
            #e0f2fe 50%,
            #0ea5e9 55%,
            #111111 75%
          );
          background-size: 200% auto;
          animation: liquid-glace 8s linear infinite;
          filter: drop-shadow(0px 2px 4px rgba(14,165,233,0.15));
        }
      `}} />

      {/* 1. PROFESSIONAL MINIMALIST BACKGROUND */}
      <div className="absolute inset-0 bg-[#FCFCFC] z-0" />
      
      {/* Refined gradient sphere - softer, more luxurious */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full blur-[120px] sm:blur-[160px] opacity-40 pointer-events-none mix-blend-multiply"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(255,255,255,0) 70%)"
        }}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />

      {/* Very subtle secondary sphere for depth */}
      <motion.div 
        className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none mix-blend-multiply"
        style={{
          background: "radial-gradient(circle, rgba(17,17,17,0.05) 0%, rgba(255,255,255,0) 70%)"
        }}
        animate={{ 
          x: [0, 20, 0],
          y: [0, -20, 0],
          opacity: [0.6, 0.8, 0.5, 0.6],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Ultra-subtle luxury noise texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

      {/* 2. CENTRAL TYPOGRAPHY & LOGO */}
      <motion.div 
        className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center"
        style={{ opacity: opacityContent, scale: scaleContent, y: yContent, filter: filterBlur }}
      >
        {/* Typo Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex flex-col items-center justify-center relative"
        >
          {/* Invisible image to set exact dimensions */}
          <img
            src="/images/nay/nay-logo-new.png"
            alt="NAY Parfums"
            className="w-32 sm:w-40 md:w-48 lg:w-56 h-auto object-contain invisible"
          />
          {/* Animated gradient mask overlaid exactly on top */}
          <div
            className="absolute inset-0 w-full h-full liquid-glace-mask opacity-90"
            style={{
              WebkitMaskImage: 'url("/images/nay/nay-logo-new.png")',
              WebkitMaskSize: 'contain',
              WebkitMaskPosition: 'center',
              WebkitMaskRepeat: 'no-repeat',
              maskImage: 'url("/images/nay/nay-logo-new.png")',
              maskSize: 'contain',
              maskPosition: 'center',
              maskRepeat: 'no-repeat',
            }}
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="flex flex-col items-center gap-5 mb-10"
        >
          <span className="w-[1px] h-14 bg-gradient-to-b from-transparent via-[#111]/20 to-transparent" />
          <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.5em] uppercase text-[#333]">
            La Collection Testeurs
          </span>
        </motion.div>

        {/* Main Headline with Liquid Glace Effect - NO PARALLAX SCROLL */}
        <h1 className="heading-font text-5xl sm:text-7xl md:text-8xl lg:text-[110px] leading-[1.1] tracking-tight mb-10 flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="font-light liquid-glace-text py-2"
          >
            L'Authenticité
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="flex items-center justify-center gap-4 sm:gap-8 mt-2"
          >
            <span className="font-serif italic font-light text-[#111]/40 text-4xl sm:text-7xl lg:text-[100px] liquid-glace-text">&</span>
            <span className="font-light liquid-glace-text">l'Élégance</span>
          </motion.div>
        </h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
          className="text-[12px] md:text-[14px] text-[#666] font-light max-w-lg mx-auto leading-[2.2] tracking-[0.2em] uppercase mb-14"
        >
          Découvrez notre sélection de <span className="font-medium text-[#111]">parfums testeurs</span> 100% originaux. Le luxe olfactif des plus grandes maisons, sublimé.
        </motion.p>
        
        {/* Découvrir Button - Luxury Minimalist Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
        >
          <Link
            href={`/${locale}/shop`}
            className="group relative inline-flex items-center justify-center overflow-hidden border border-[#111]/20 bg-white/80 backdrop-blur-xl px-16 py-5 transition-all duration-700 hover:bg-[#111] hover:border-[#111] hover:shadow-2xl rounded-none"
          >
            <span className="relative z-10 text-[10px] font-semibold tracking-[0.4em] uppercase text-[#111] transition-colors duration-500 group-hover:text-white">
              Découvrir
            </span>
            <div className="absolute inset-0 bg-[#111] transform scale-x-0 origin-left transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-x-100" />
          </Link>
        </motion.div>
      </motion.div>

      {/* 3. SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.2 }}
        style={{ opacity: opacityContent }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-5"
      >
        <span className="text-[8px] font-semibold tracking-[0.5em] uppercase text-[#111]/40">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-[#111]/10 overflow-hidden relative">
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute top-0 bottom-0 left-0 right-0 bg-[#111]/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
