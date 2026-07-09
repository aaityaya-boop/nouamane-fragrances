'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Product } from '@/lib/products';

export default function BestsellersDirectory({ products }: { products: Product[] }) {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';
  return (
    <div className="relative w-full border-t border-[#e0ddd4] pt-4">
      {/* The Floating Image Reveal */}


      {/* The Typography List */}
      <div className="flex flex-col w-full relative z-10">
        {products.map((p, index) => (
          <Link
            href={`/${locale}/product/${p.slug}`}
            key={p.id}
            className="group flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#e0ddd4]/60 py-8 lg:py-14 px-2 hover:px-8 transition-all duration-500 cursor-pointer"
          >
            <div className="flex items-baseline gap-6 md:gap-12">
              <span className="text-sm md:text-lg font-light text-[#9A9A9A] w-6 md:w-8">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <h3 className="heading-font text-3xl md:text-5xl lg:text-[4rem] text-[#1A1A1A] leading-none tracking-tight uppercase group-hover:text-[#0ea5e9] transition-colors duration-500">
                {p.brandLabel} <span className="font-light md:ml-4 block md:inline mt-2 md:mt-0 opacity-70 group-hover:opacity-100 transition-opacity">{p.name}</span>
              </h3>
            </div>
            <div className="mt-4 md:mt-0 ml-12 md:ml-0 text-lg md:text-xl font-medium text-[#1A1A1A]/80 tracking-widest whitespace-nowrap">
              {p.price} MAD
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
