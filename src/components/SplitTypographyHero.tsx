'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SplitTypographyHero({ config }: { config?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const springConfig = { damping: 25, stiffness: 50 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 100;
      const y = (clientY / innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Sophisticated Parallax Scrolling Effects
  const opacityContent = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scaleContent = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  
  // Text Splitting Parallax
  const leftTextX = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const rightTextX = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  
  // Background Elements Parallax
  const bgY1 = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const bgY2 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  
  // Watermark Parallax
  const watermarkY = useTransform(scrollYProgress, [0, 1], ['20%', '-80%']);

  return (
    <section 
      ref={containerRef} 
      className="relative h-[100dvh] min-h-[650px] w-full bg-[#FCFCFC] overflow-hidden flex items-center justify-center selection:bg-[#111] selection:text-white"
    >
      {/* 1. LUXURY BACKGROUND: Animated Glass Shapes & Mouse Parallax */}
      <div className="absolute inset-0 bg-[#FCFCFC] z-0" />
      
      {/* Huge Background Watermark */}
      <motion.div 
        style={{ y: watermarkY, opacity: opacityContent }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
      >
        <span className="font-serif italic text-[15vw] leading-none text-[#111]/[0.02] whitespace-nowrap rotate-[-5deg] scale-150">
          NAY PARFUMS
        </span>
      </motion.div>
      
      {/* Interactive Shape 1 */}
      <motion.div 
        style={{ y: bgY1, x: mouseX }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] opacity-30 mix-blend-multiply pointer-events-none"
      >
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="w-full h-full bg-gradient-to-br from-[#0ea5e9] to-transparent rounded-full"
        />
      </motion.div>

      {/* Interactive Shape 2 */}
      <motion.div 
        style={{ y: bgY2, x: useTransform(mouseX, (v) => -v) }}
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[1000px] max-h-[1000px] rounded-full blur-[120px] opacity-20 mix-blend-multiply pointer-events-none"
      >
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="w-full h-full bg-gradient-to-tl from-[#111] via-[#333] to-transparent rounded-full"
        />
      </motion.div>

      {/* Floating Sparkles/Dust */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: Math.random() * 100 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              y: [Math.random() * 100, Math.random() * -100 - 50],
              x: Math.random() * 50 - 25
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
            className="absolute rounded-full bg-[#111]/10"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      {/* Ultra-subtle luxury noise texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

      <motion.div 
        className="relative z-10 w-full max-w-[1400px] mx-auto px-6 text-center flex flex-col items-center justify-center"
        style={{ opacity: opacityContent, scale: scaleContent }}
      >
        {/* Typo Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col items-center justify-center relative group"
        >
          <img
            src="/images/nay/nay-logo-new.png"
            alt="NAY Parfums"
            className="w-32 sm:w-40 md:w-48 lg:w-56 h-auto object-contain transition-transform duration-1000 group-hover:scale-105"
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="flex flex-col items-center gap-5 mb-8"
        >
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.6em] uppercase text-[#111]/50">
            L'Art de la Parfumerie
          </span>
          <span className="w-[1px] h-10 bg-gradient-to-b from-[#111]/20 to-transparent" />
        </motion.div>

        {/* Main Headline with Split Parallax Effect */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[120px] xl:text-[140px] leading-[1] tracking-[-0.02em] mb-10 flex flex-col items-center justify-center w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            style={{ x: leftTextX }}
            className="font-light text-[#111] pr-4 sm:pr-12 md:pr-24 self-center md:self-end text-center md:text-right mix-blend-darken relative"
          >
            L'Empreinte
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            style={{ x: rightTextX }}
            className="flex items-center gap-4 sm:gap-6 pl-4 sm:pl-12 md:pl-24 self-center md:self-start mt-2 sm:mt-0 mix-blend-darken relative"
          >
            <span className="font-serif italic font-light text-[#0ea5e9] text-5xl sm:text-7xl md:text-8xl lg:text-[130px] xl:text-[150px] drop-shadow-sm">&</span>
            <span className="font-serif italic font-light text-[#111]">l'Inoubliable</span>
          </motion.div>
        </h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
          className="text-[11px] sm:text-[13px] md:text-[14px] text-[#555] font-light max-w-2xl mx-auto leading-[2.2] tracking-[0.2em] uppercase mb-16"
        >
          Découvrez notre sélection de <span className="font-semibold text-[#111]">parfums prestigieux</span>. L'essence du luxe, de la magie orientale et de l'exception.
        </motion.p>
        
        {/* Découvrir Button - Luxury Minimalist Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
        >
          <Link
            href={`/${locale}/decouverte`}
            className="group relative inline-flex items-center justify-center overflow-hidden border border-[#111]/20 bg-white/50 backdrop-blur-md px-16 py-5 transition-all duration-700 hover:border-[#111] hover:shadow-2xl rounded-full"
          >
            <div className="absolute inset-0 bg-[#111] transform scale-y-0 origin-bottom transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-y-100" />
            <span className="relative z-10 text-[10px] font-semibold tracking-[0.4em] uppercase text-[#111] transition-colors duration-500 group-hover:text-white">
              Découvrir
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* 3. SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.2 }}
        style={{ opacity: opacityContent }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-[8px] font-semibold tracking-[0.5em] uppercase text-[#111]/40">
          Scroll
        </span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-[#111]/20 to-transparent overflow-hidden relative">
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute top-0 bottom-0 left-0 right-0 h-1/2 bg-[#111]/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
