'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function SplitTypographyHero({ config }: { config?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position for the typography
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100, mass: 0.5 });

  // Map scroll progress to horizontal translation (Scrolling Effect)
  const xLeft = useTransform(smoothProgress, [0, 1], ["0%", "-30%"]);
  const xRight = useTransform(smoothProgress, [0, 1], ["-20%", "10%"]);
  
  // Parallax for the main image
  const yImage = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
  const opacityFade = useTransform(smoothProgress, [0, 0.8], [1, 0]);

  const textString = "NOUAMANE PARFUMS — ".repeat(6);
  const heroTitle = config?.heroTitle || "L'Essence de l'Élégance";
  const heroSubtitle = config?.heroSubtitle || "Découvrez notre collection de parfums de luxe, conçue pour laisser une empreinte inoubliable.";

  return (
    <section 
      ref={containerRef} 
      className="relative h-[120vh] w-full bg-[#fafaf7] overflow-hidden"
    >
      {/* Sticky container holds everything in place while scrolling the 120vh */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* PARALLAX BACKGROUND IMAGE */}
        <motion.div 
          style={{ y: yImage, opacity: opacityFade }} 
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src="https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400"
            alt="Parfums de luxe"
            fill
            priority
            className="object-cover object-[center_30%]"
          />
          {/* Subtle gradient to blend the image into the background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#fafaf7] via-transparent to-black/30" />
        </motion.div>

        {/* SCROLLING TYPOGRAPHY BACKGROUND (Stylish Effect) */}
        <div className="absolute inset-0 flex flex-col justify-center gap-12 lg:gap-24 pointer-events-none opacity-40 mix-blend-overlay">
          {/* Moving Left */}
          <motion.div style={{ x: xLeft }} className="whitespace-nowrap flex items-center">
            <h1 
              className="heading-font text-[10vw] md:text-[8vw] leading-none tracking-widest text-transparent uppercase"
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.8)' }}
            >
              {textString}
            </h1>
          </motion.div>
          
          {/* Moving Right */}
          <motion.div style={{ x: xRight }} className="whitespace-nowrap flex items-center">
            <h1 
              className="heading-font text-[10vw] md:text-[8vw] leading-none tracking-widest text-transparent uppercase"
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.8)' }}
            >
              {textString}
            </h1>
          </motion.div>
        </div>

        {/* CENTERED CONTENT (Glassmorphism & Elegant Typography) */}
        <motion.div 
          style={{ opacity: opacityFade }}
          className="relative z-20 flex flex-col items-center justify-center text-center px-6 mt-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full mb-6"
          >
            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase text-white shadow-sm">
              Collection Exclusive
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="heading-font text-5xl md:text-7xl lg:text-[80px] text-white tracking-wide max-w-4xl leading-[1.1] mb-6 drop-shadow-2xl"
          >
            {heroTitle}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
            className="text-[14px] md:text-[16px] text-white/90 font-medium max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md"
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
          >
            <Link 
              href="/shop"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-12 py-4 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
            >
              <span className="relative z-10 text-[11px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A] transition-colors group-hover:text-white">
                Explorer la boutique
              </span>
              <div className="absolute inset-0 z-0 h-full w-full bg-[#0ea5e9] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
          <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-white/70">Scroll</span>
          <div className="w-[1px] h-10 bg-white/20 overflow-hidden">
            <motion.div 
              animate={{ y: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-full h-1/2 bg-white"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
