import React, { use, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ShopCatalog from '@/components/ShopCatalog';
import {
  MAIN_CATEGORIES,
  getCategoryBySlug,
  type Gender,
} from '@/lib/products';
import prisma from '@/lib/prisma';
import { ChevronRight } from 'lucide-react';

/**
 * Category landing page — Women / Men / Unisex.
 * Displays hero image, category description, subcategory shortcuts, then full catalog locked to the gender.
 */

type Params = { locale: string; gender: string };

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, gender } = await params;
  const category = getCategoryBySlug(gender);
  if (!category) notFound();

  const dbProducts = await prisma.product.findMany({
    where: { gender: category.key }
  });
  
  const dbBrands = await prisma.brand.findMany();

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

  return (
    <div className="bg-[#fafaf7] text-[#1A1A1A] min-h-screen">
      <Header />

      {/* HERO */}
      <section className="relative h-[50vh] min-h-[380px] flex items-center overflow-hidden">
        <Image
          src={category.heroImage}
          alt={category.label}
          fill
          priority
          className="object-cover brightness-[0.55]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 lg:px-10 pt-16">
          <nav className="flex items-center gap-2 text-[11px] text-white/70 mb-6">
            <Link href={`/${locale}`} className="hover:text-[#0ea5e9]">Accueil</Link>
            <ChevronRight size={12} />
            <Link href={`/${locale}/shop`} className="hover:text-[#0ea5e9]">Boutique</Link>
            <ChevronRight size={12} />
            <span className="text-white">{category.label}</span>
          </nav>

          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#38bdf8]">
            Collection
          </span>
          <h1 className="heading-font text-white text-5xl lg:text-7xl mt-3 tracking-wide">
            {category.label}
          </h1>
          <p className="mt-4 text-white/70 text-[14px] max-w-md">
            {products.length} fragrances · Valentino · YSL · Armani
          </p>
        </div>
      </section>

      {/* DESCRIPTION + SUBCATS */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 border-b border-[#e0ddd4]">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-start">
          <p className="text-[15px] lg:text-base text-[#6B6B6B] leading-[1.85] max-w-3xl">
            {category.description}
          </p>

          {/* Subcategory chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] self-center mr-2 hidden lg:inline">
              Famille :
            </span>
            {category.subcategories.map((sc) => (
              <a
                key={sc.slug}
                href={`#${sc.slug}`}
                className="text-[11px] font-semibold tracking-[0.15em] uppercase border border-[#e0ddd4] hover:border-[#0ea5e9] hover:text-[#0ea5e9] text-[#6B6B6B] rounded-full px-4 py-2 transition-all"
              >
                {sc.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOG (locked to gender) */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">
        <Suspense fallback={<div className="text-[#9A9A9A]">Chargement…</div>}>
          <ShopCatalog products={products} brands={dbBrands} lockedGender={category.key as Gender} />
        </Suspense>
      </section>

      <Footer />
      <CartDrawer />
    </div>
  );
}

/* Enable static generation for all 3 categories */
export function generateStaticParams() {
  return MAIN_CATEGORIES.map((c) => ({ gender: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { gender } = await params;
  const cat = getCategoryBySlug(gender);
  return {
    title: cat ? `${cat.label} | Nouamane Parfums` : 'Nouamane Parfums',
    description: cat?.description || '',
  };
}
