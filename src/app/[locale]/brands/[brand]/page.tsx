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
      <section className="relative h-[70vh] min-h-[550px] flex items-center justify-center text-center overflow-hidden">
        <Image
          src={brand.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1600&h=900'}
          alt={brand.label}
          fill
          priority
          className="object-cover brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80" />
        
        <div className="relative z-10 max-w-3xl w-full mx-auto px-6 pt-16 flex flex-col items-center">
          <nav className="flex items-center justify-center gap-2 text-[11px] text-white/70 mb-10">
            <Link href={`/${locale}`} className="hover:text-[#0ea5e9]">Accueil</Link>
            <ChevronRight size={12} />
            <Link href={`/${locale}/shop`} className="hover:text-[#0ea5e9]">Marques</Link>
            <ChevronRight size={12} />
            <span className="text-white">{brand.label}</span>
          </nav>

          {/* Brand Logo Container */}
          <div className="w-36 h-36 md:w-48 md:h-48 bg-white/95 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center p-6 md:p-8 mb-8 border border-white/20">
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

          <p className="text-[14px] md:text-[16px] text-white/90 leading-relaxed font-light mb-8 max-w-2xl">
            {brand.description}
          </p>

          <div className="inline-flex items-center justify-center px-6 py-2.5 border border-white/30 rounded-full text-[11px] font-bold uppercase tracking-widest text-white/80 bg-white/5 backdrop-blur-sm">
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

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { brand: brandSlug } = await params;
  const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
  return {
    title: brand ? `${brand.label} | Nouamane Parfums` : 'Nouamane Parfums',
    description: brand?.description || '',
  };
}
