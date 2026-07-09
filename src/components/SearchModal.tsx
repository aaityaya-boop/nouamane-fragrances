'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Product } from '@/lib/products';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.products) {
          // Parse JSON strings to match frontend Product type
          const parsed = data.products.map((p: any) => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
          }));
          setResults(parsed);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(30px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-white/95 overflow-y-auto"
        >
          <div className="absolute top-8 right-8">
            <button
              onClick={onClose}
              className="p-3 bg-[#eeece5] hover:bg-[#e0ddd4] text-[#1A1A1A] rounded-full transition-colors backdrop-blur-md"
            >
              <X size={24} />
            </button>
          </div>

          <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
            <div className="relative">
              <SearchIcon size={40} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Explorer notre collection..."
                className="w-full bg-transparent border-b border-[#e0ddd4] focus:border-[#1A1A1A] text-4xl md:text-6xl heading-font text-[#1A1A1A] placeholder:text-[#1A1A1A]/20 pl-16 md:pl-20 pb-6 outline-none transition-colors"
              />
            </div>

            <div className="mt-16">
              {isLoading && (
                <div className="text-[14px] text-[#9A9A9A] animate-pulse">Chargement de la collection...</div>
              )}
              
              {!isLoading && query.length > 0 && results.length === 0 && (
                <div className="text-[18px] text-[#6B6B6B]">Aucune fragrance trouvée pour "{query}".</div>
              )}

              {!isLoading && results.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-14"
                >
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/product/${product.slug}`}
                      onClick={onClose}
                      className="group flex flex-col gap-4"
                    >
                      <div className="relative w-full aspect-[4/5] bg-[#f8fafc] rounded-2xl overflow-hidden border border-[#e0ddd4] shadow-sm">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9] mb-2">
                          {product.brandLabel || product.brand}
                        </div>
                        <h3 className="heading-font text-2xl lg:text-3xl text-[#1A1A1A] group-hover:text-[#0ea5e9] transition-colors line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        <div className="text-[14px] font-semibold text-[#6B6B6B] mt-2">
                          {product.price} MAD
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
