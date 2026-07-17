import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ShopCatalog from '@/components/ShopCatalog';
import { type Brand } from '@/lib/products';
import prisma from '@/lib/prisma';
import { ChevronRight } from 'lucide-react';

type Params = { locale: string; brand: string };

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug }
  });

  if (!brand) return { title: 'Marque introuvable | NAY Parfums' };

  return {
    title: `Parfums ${brand.name} | Acheter au Maroc`,
    description: `Découvrez la collection de parfums ${brand.name} chez NAY Parfums. 100% authentique. Livraison rapide partout au Maroc.`,
    openGraph: {
      title: `Parfums ${brand.name} | Acheter au Maroc`,
      description: `Découvrez la collection de parfums ${brand.name} chez NAY Parfums. 100% authentique. Livraison rapide partout au Maroc.`,
      images: [{ url: `/images/brands/${brand.slug}-hero.jpg` }]
    }
  };
}
export default async function BrandPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, brand: brandSlug } = await params;
  
  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug }
  });
  
  if (!brand) notFound();

  const dbProducts = await prisma.product.findMany({
    where: { brandId: brand.slug }
  });

  const products = dbProducts.map((p) => ({
    ...p,
    brand: p.brandId as any,
    gender: p.gender as any,
    subcategory: p.subcategory as any,
    images: JSON.parse(p.images),
    notes: JSON.parse(p.notes),
    sizes: JSON.parse(p.sizes),
    tags: JSON.parse(p.tags) as any,
    bottleColor: p.bottleColor as any,
    bottleMaterial: p.bottleMaterial as any,
    perfectSeason: p.perfectSeason as any,
    originalPrice: p.originalPrice ?? undefined,
  }));

  const dbBrands = await prisma.brand.findMany();

  const otherBrands = await prisma.brand.findMany({
    where: { slug: { not: brand.slug } },
    take: 4
  });

  return (
    <div className="bg-[#fafaf7] text-[#1A1A1A] min-h-screen">
      <Header />

      {/* HERO */}
      <section className="relative pt-32 pb-16 min-h-[300px] flex items-center justify-center text-center overflow-hidden bg-[#fafaf7]">
        {/* Background Aura */}
        <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-[#0ea5e9]/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10 max-w-3xl w-full mx-auto px-6 flex flex-col items-center">
          <nav className="flex items-center justify-center gap-2 text-[11px] text-[#6B6B6B] mb-10">
            <Link href={`/${locale}`} className="hover:text-[#0ea5e9]">Accueil</Link>
            <ChevronRight size={12} />
            <Link href={`/${locale}/shop`} className="hover:text-[#0ea5e9]">Marques</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] font-medium">{brand.label}</span>
          </nav>

          {/* Brand Logo Container */}
          <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-full bg-white border border-[#e0ddd4] p-4 flex items-center justify-center shadow-sm mb-6 mix-blend-multiply">
            <div className="relative w-full h-full">
              <Image 
                src={`/images/brands/${brand.slug}-logo.jpg`} 
                alt={`${brand.label} Logo`}
                fill
                sizes="(max-width: 768px) 150px, 200px"
                className="object-contain mix-blend-multiply" 
              />
            </div>
          </div>

          <p className="text-[14px] md:text-[16px] text-[#6B6B6B] leading-relaxed font-light mb-8 max-w-2xl">
            {brand.description}
          </p>

          <div className="inline-flex items-center justify-center px-6 py-2.5 border border-[#e0ddd4] rounded-full text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] bg-white shadow-sm">
            {products.length} parfums disponibles
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">
        <Suspense fallback={<div className="text-[#9A9A9A]">Chargement…</div>}>
          <ShopCatalog products={products} brands={dbBrands} lockedBrand={brand.slug as Brand} />
        </Suspense>
      </section>

      {/* OTHER BRANDS */}
      <section className="bg-transparent border-t border-[#e0ddd4]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
              Autres Maisons
            </span>
            <h2 className="heading-font text-3xl lg:text-4xl mt-2 tracking-wide">
              Explorer nos autres marques
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherBrands.map((b) => (
              <Link
                key={b.slug}
                href={`/brands/${b.slug}`}
                className="group border border-[#e0ddd4] bg-white rounded-xl overflow-hidden hover:border-[#0ea5e9] transition-all hover:shadow-lg flex flex-col h-40"
              >
                <div className="relative h-full w-full flex flex-col items-center justify-center p-6">
                  <Image 
                    src={`/images/brands/${b.slug}-logo.jpg`} 
                    alt={b.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-contain p-8 pb-10 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 mix-blend-multiply" 
                  />
                  <div className="absolute bottom-4 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] group-hover:text-[#0ea5e9] transition-colors line-clamp-1">{b.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <CartDrawer />
    </div>
  );
}


