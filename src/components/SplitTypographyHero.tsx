'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
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

  // 3D Parallax Mouse Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalize to -1 to 1
    const x = (clientX / innerWidth) * 2 - 1; 
    const y = (clientY / innerHeight) * 2 - 1; 
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Background tilts opposite to mouse
  const rotateX = useTransform(smoothY, [-1, 1], [8, -8]);
  const rotateY = useTransform(smoothX, [-1, 1], [-8, 8]);

  // Foreground elements float towards mouse
  const xText = useTransform(smoothX, [-1, 1], [30, -30]);
  const yText = useTransform(smoothY, [-1, 1], [30, -30]);

  const xCard = useTransform(smoothX, [-1, 1], [20, -20]);
  const yCard = useTransform(smoothY, [-1, 1], [20, -20]);

  const heroTitle = config?.heroTitle || "L'Essence";
  const heroSubtitle = config?.heroSubtitle || "Découvrez une collection de parfums de luxe, sélectionnée avec soin pour laisser une empreinte inoubliable.";

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1500 }}
    >
      {/* 1. 3D BACKGROUND PARALLAX TILT */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: "preserve-3d" 
        }}
      >
        <motion.div 
          className="relative w-[110%] h-[110%]"
        >
          <Image
            src="https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="Parfum de luxe"
            fill
            priority
            className="object-cover object-[center_30%]"
          />
          {/* Refined gradient overlays for maximum luxury feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </motion.div>
      </motion.div>

      {/* 2. MAIN CONTENT (FLOATING TEXT IN 3D SPACE) */}
      <motion.div 
        className="relative z-20 h-full max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col justify-center pb-10 pointer-events-none"
        style={{ opacity: opacityText, x: xText, y: yText }}
      >
        <div className="max-w-4xl mt-20 pointer-events-auto">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex items-center gap-4 mb-8 sm:mb-12"
          >
            <span className="w-12 h-[1px] bg-[#0ea5e9]/70 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.4em] uppercase text-[#0ea5e9]">
              Maison de Haute Parfumerie
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="heading-font text-6xl sm:text-7xl md:text-8xl lg:text-[120px] text-white tracking-wide leading-[1.05] mb-10 sm:mb-12 drop-shadow-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="overflow-hidden"
            >
              {heroTitle}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
              className="flex items-center gap-4 sm:gap-6 mt-2"
            >
              <span className="text-4xl sm:text-6xl lg:text-8xl font-serif text-[#0ea5e9]/80 italic font-light">&</span>
              <span className="text-[#e0ddd4]">de l'Élégance</span>
            </motion.div>
          </h1>

          {/* Subtitle & CTA in a sophisticated layout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:gap-16 pl-0 sm:pl-16 border-l border-transparent sm:border-white/20"
          >
            <p className="text-[14px] md:text-[16px] text-white/70 font-light max-w-[320px] leading-[1.9] tracking-wide drop-shadow-md">
              {heroSubtitle}
            </p>
            <Link
              href={`/${locale}/shop`}
              className="group relative inline-flex items-center justify-center overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md px-12 py-5 transition-all duration-700 hover:bg-white hover:border-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] pointer-events-auto"
            >
              <span className="relative z-10 text-[10px] font-bold tracking-[0.3em] uppercase text-white transition-colors duration-500 group-hover:text-black">
                Découvrir
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 3. FLOATING GLASS CARD (3D Parallax Right Side) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
        style={{ opacity: opacityText, x: xCard, y: yCard }}
        className="absolute bottom-24 right-6 lg:right-12 z-20 hidden lg:flex flex-col gap-6 pointer-events-none"
      >
        <div className="bg-[#0D0D0D]/30 backdrop-blur-2xl border border-white/20 p-10 w-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full animate-pulse shadow-[0_0_10px_#0ea5e9]" />
            <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/80">
              L'Art du Parfum
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4 group">
              <span className="text-white/60 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors group-hover:text-white">Authenticité</span>
              <span className="heading-font text-3xl text-white group-hover:text-[#0ea5e9] transition-colors drop-shadow-md">100%</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/10 pb-4 group">
              <span className="text-white/60 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors group-hover:text-white">Livraison</span>
              <span className="heading-font text-3xl text-white group-hover:text-[#0ea5e9] transition-colors drop-shadow-md">24H</span>
            </div>
            <div className="flex justify-between items-end group">
              <span className="text-white/60 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors group-hover:text-white">Clients</span>
              <span className="heading-font text-3xl text-white group-hover:text-[#0ea5e9] transition-colors drop-shadow-md">500+</span>
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 pointer-events-none"
      >
        <div className="w-[1px] h-16 bg-white/20 overflow-hidden relative rounded-full">
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute top-0 bottom-0 left-0 right-0 bg-white"
          />
        </div>
        <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-white/50">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
