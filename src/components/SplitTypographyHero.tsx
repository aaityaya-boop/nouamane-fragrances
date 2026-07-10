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

  // Scroll Effects
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scaleText = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const yAura = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full bg-white overflow-hidden flex items-center justify-center selection:bg-[#0ea5e9] selection:text-white"
    >
      {/* CSS for Liquid Glass Effect */}
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
          /* Add a tiny drop shadow to enhance the glass extrusion */
          filter: drop-shadow(0px 2px 4px rgba(14,165,233,0.15));
        }
      `}} />

      {/* 1. THE INVISIBLE AURA (Animated Background) */}
      <motion.div 
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
        style={{ y: yAura }}
      >
        <motion.div
          className="absolute w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[180px]"
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-[#0ea5e9]/5 rounded-full blur-[100px] md:blur-[150px]"
          animate={{
            x: [0, -150, 150, 0],
            y: [0, 150, -150, 0],
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Subtle Luxury Texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

      {/* 2. CENTRAL TYPOGRAPHY & LOGO */}
      <motion.div 
        className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center"
        style={{ opacity: opacityText, scale: scaleText, y: yText }}
      >
        {/* Typo Logo with Liquid Glace Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col items-center justify-center"
        >
          <h2 className="heading-font text-3xl md:text-5xl tracking-[0.3em] font-light liquid-glace-text">
            NOUAMANE
          </h2>
          <span className="text-[7px] md:text-[9px] font-bold tracking-[0.5em] uppercase text-[#0ea5e9] mt-2 opacity-80">
            Parfums
          </span>
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex flex-col items-center gap-4 mb-8 sm:mb-10"
        >
          <span className="w-[1px] h-12 bg-gradient-to-b from-transparent to-[#0ea5e9]" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.4em] uppercase text-[#0ea5e9]">
            La Collection Testeurs
          </span>
        </motion.div>

        {/* Main Headline with Liquid Glace Effect */}
        <h1 className="heading-font text-5xl sm:text-7xl md:text-8xl lg:text-[120px] leading-[1.05] tracking-tight mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="overflow-hidden font-light liquid-glace-text py-2"
          >
            L'Authenticité
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="flex items-center justify-center gap-4 sm:gap-6 mt-2"
          >
            <span className="font-serif italic font-light text-[#0ea5e9] text-4xl sm:text-7xl lg:text-[110px] liquid-glace-text">&</span>
            <span className="font-light liquid-glace-text">l'Élégance</span>
          </motion.div>
        </h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="text-[13px] md:text-[15px] text-[#555] font-light max-w-xl mx-auto leading-[2] tracking-widest uppercase mb-12"
        >
          Découvrez notre sélection de <span className="font-semibold text-[#111]">parfums testeurs</span> 100% originaux. Le luxe olfactif des plus grandes maisons, sublimé.
        </motion.p>
        
        {/* Découvrir Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        >
          <Link
            href={`/${locale}/shop`}
            className="group relative inline-flex items-center justify-center overflow-hidden border border-[#0ea5e9]/30 bg-white/50 backdrop-blur-md px-14 py-5 transition-all duration-700 hover:bg-[#0ea5e9] hover:border-[#0ea5e9] hover:shadow-[0_0_40px_rgba(14,165,233,0.4)] rounded-full"
          >
            <span className="relative z-10 text-[10px] font-bold tracking-[0.3em] uppercase text-[#111] transition-colors duration-500 group-hover:text-white">
              Découvrir
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* 3. SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        style={{ opacity: opacityText }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
      >
        <div className="w-[1px] h-16 bg-[#111]/10 overflow-hidden relative">
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute top-0 bottom-0 left-0 right-0 bg-[#0ea5e9]"
          />
        </div>
        <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#111]/40">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
