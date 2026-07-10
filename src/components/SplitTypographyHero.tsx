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

  const opacityText = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const yImage = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const heroTitle = config?.heroTitle || "L'Authenticité";
  
  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full bg-white text-[#111] overflow-hidden flex items-center"
    >
      {/* BACKGROUND NOISE / TEXTURE (Subtle paper texture for luxury feel) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

      {/* Abstract Blue Accent in Background */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#0ea5e9]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-12 h-full flex flex-col lg:flex-row relative z-10 pt-24 lg:pt-0">
        
        {/* LEFT: EDITORIAL TYPOGRAPHY */}
        <motion.div 
          className="flex-1 flex flex-col justify-center relative z-20 pt-10 lg:pt-0"
          style={{ opacity: opacityText }}
        >
          <div className="max-w-2xl">
            {/* Minimalist Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 mb-8 lg:mb-12"
            >
              <span className="w-8 h-[1px] bg-[#0ea5e9]" />
              <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.5em] uppercase text-[#0ea5e9]">
                La Collection Testeurs
              </span>
            </motion.div>

            {/* Massive Editorial Title */}
            <h1 className="heading-font text-6xl sm:text-7xl md:text-8xl lg:text-[105px] leading-[1] tracking-tight mb-10">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="overflow-hidden font-light text-[#111]"
              >
                {heroTitle}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                className="flex items-center gap-3 sm:gap-5 mt-1 lg:mt-3"
              >
                <span className="font-serif italic font-light text-[#0ea5e9] text-5xl sm:text-7xl lg:text-8xl">&</span>
                <span className="font-light text-[#111]/80">l'Élégance</span>
              </motion.div>
            </h1>

            {/* Sophisticated Body Copy & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:gap-12"
            >
              <p className="text-[13px] md:text-[14px] text-[#555] font-light max-w-[300px] leading-[1.9] tracking-widest uppercase">
                Découvrez notre sélection de <span className="font-semibold text-[#111]">parfums testeurs</span> 100% originaux. Le luxe olfactif des plus grandes maisons, accessible.
              </p>
              
              {/* The "Découvrir" button effect adapted for light mode */}
              <Link
                href={`/${locale}/shop`}
                className="group relative inline-flex items-center justify-center overflow-hidden border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 backdrop-blur-md px-12 py-5 transition-all duration-700 hover:bg-[#0ea5e9] hover:border-[#0ea5e9] hover:shadow-[0_0_30px_rgba(14,165,233,0.3)]"
              >
                <span className="relative z-10 text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9] transition-colors duration-500 group-hover:text-white">
                  Découvrir
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT: TALL EDITORIAL IMAGE */}
        <motion.div 
          className="flex-1 relative h-[50vh] lg:h-full w-full mt-12 lg:mt-0 lg:ml-12 hidden md:block"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full lg:w-[85%] h-[80%] lg:h-[85%] rounded-t-full rounded-b-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#0ea5e9]/10">
            <motion.div style={{ y: yImage }} className="relative w-full h-[120%] -top-[10%]">
              <Image
                src="https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&fit=crop"
                alt="Parfum testeur de luxe"
                fill
                priority
                className="object-cover"
              />
              {/* Light luxurious gradient over the image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-[#0ea5e9]/10 mix-blend-overlay" />
            </motion.div>
          </div>
          
          {/* Subtle Accent Glow around the image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#0ea5e9]/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        </motion.div>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        style={{ opacity: opacityText }}
        className="absolute bottom-10 left-6 lg:left-12 z-20 flex items-center gap-4"
      >
        <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#111]/40 rotate-180" style={{ writingMode: 'vertical-rl' }}>
          Scroll
        </span>
        <div className="w-[1px] h-16 bg-[#111]/10 overflow-hidden relative">
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute top-0 bottom-0 left-0 right-0 bg-[#0ea5e9]"
          />
        </div>
      </motion.div>
    </section>
  );
}
