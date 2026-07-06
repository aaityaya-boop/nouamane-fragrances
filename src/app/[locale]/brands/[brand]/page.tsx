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
      <section className="relative h-[55vh] min-h-[420px] flex items-center overflow-hidden">
        <Image
          src={brand.image || 'https://images.pexels.com/photos/11216321/pexels-photo-11216321.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600'}
          alt={brand.label}
          fill
          priority
          className="object-cover brightness-[0.5]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/75" />
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 lg:px-10 pt-16">
          <nav className="flex items-center gap-2 text-[11px] text-white/70 mb-6">
            <Link href={`/${locale}`} className="hover:text-[#0ea5e9]">Accueil</Link>
            <ChevronRight size={12} />
            <span className="text-white/50">Marques</span>
            <ChevronRight size={12} />
            <span className="text-white">{brand.label}</span>
          </nav>

          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#38bdf8]">
            La Maison
          </span>
          <h1 className="heading-font text-white text-5xl lg:text-8xl mt-3 tracking-wide leading-none">
            {brand.label}
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-semibold tracking-[0.15em] uppercase text-white/60">
            <span>{products.length} parfums disponibles</span>
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 border-b border-[#e0ddd4]">
        <div className="max-w-3xl">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
            Notre Histoire avec {brand.label}
          </span>
          <p className="mt-4 text-[15px] lg:text-base text-[#6B6B6B] leading-[1.85]">
            {brand.description}
          </p>
          <p className="mt-4 text-[14px] text-[#9A9A9A] leading-[1.85]">
            <span className="font-semibold text-[#1A1A1A]">Authenticité 100% garantie.</span>{' '}
            Nouamane est un revendeur autorisé — tous nos parfums {brand.label} sont
            importés directement depuis les distributeurs officiels, avec facture
            d&apos;origine. Livraison partout au Maroc avec 35Dh.
          </p>
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
                className="group relative h-48 rounded-2xl overflow-hidden border border-[#e0ddd4] hover:border-[#0ea5e9]/50 transition-all"
              >
                <Image src={b.image || '/images/dg_imperatrice.png'} alt={b.label} fill className="object-cover brightness-50 group-hover:brightness-75 transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <div className="heading-font text-2xl text-white mt-1 tracking-wide">
                    {b.label}
                  </div>
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
