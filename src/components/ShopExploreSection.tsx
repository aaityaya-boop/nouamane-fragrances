'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Star, Target, Crown } from 'lucide-react';

const categories = [
  {
    title: 'Pour Lui',
    description: 'Caractère et Puissance',
    href: '/shop/homme',
    image: 'https://images.unsplash.com/photo-1615160677561-1e9671d4314e?q=80&w=800&auto=format&fit=crop',
    icon: <Crown className="w-5 h-5" />,
    color: 'from-blue-900/80 to-black/90'
  },
  {
    title: 'Pour Elle',
    description: 'Élégance et Séduction',
    href: '/shop/femme',
    image: 'https://images.unsplash.com/photo-1595532588147-38e9cff58c14?q=80&w=800&auto=format&fit=crop',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-rose-900/80 to-black/90'
  },
  {
    title: 'Nouveautés',
    description: 'Les dernières créations',
    href: '/shop?sort=newest',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
    icon: <Star className="w-5 h-5" />,
    color: 'from-amber-900/80 to-black/90'
  },
  {
    title: 'Best-sellers',
    description: 'Nos parfums iconiques',
    href: '/shop?sort=popular',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop',
    icon: <Target className="w-5 h-5" />,
    color: 'from-emerald-900/80 to-black/90'
  }
];

export default function ShopExploreSection() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 mb-20">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
          Explorez
        </span>
        <h2 className="heading-font text-3xl lg:text-4xl mt-2 tracking-wide text-[#1A1A1A]">
          Par Où Commencer ?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link 
              href={cat.href}
              className="group relative block h-[300px] rounded-3xl overflow-hidden"
            >
              <Image 
                src={cat.image} 
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-80 group-hover:opacity-90 transition-opacity duration-500`} />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <div className="mb-3 text-[#0ea5e9]">
                  {cat.icon}
                </div>
                <h3 className="text-2xl heading-font mb-1 tracking-wide">
                  {cat.title}
                </h3>
                <p className="text-xs tracking-widest uppercase text-white/70 font-semibold">
                  {cat.description}
                </p>
                
                <div className="mt-6 flex items-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="relative overflow-hidden">
                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                      Découvrir
                    </span>
                    <span className="absolute top-0 left-0 block translate-y-full transition-transform duration-300 group-hover:translate-y-0 text-[#0ea5e9]">
                      Découvrir
                    </span>
                  </span>
                  <svg className="w-3 h-3 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
