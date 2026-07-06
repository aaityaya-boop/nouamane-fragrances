import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ShopCatalog from '@/components/ShopCatalog';
import prisma from '@/lib/prisma';
import { Product, MAIN_CATEGORIES } from '@/lib/products';

export const metadata = {
  title: 'Boutique | Nouamane Parfums',
  description:
    'Découvrez toute la collection de parfums Valentino, YSL et Armani. Filtrage par marque, genre, prix, taille, couleur et note.',
};

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const dbProducts = await prisma.product.findMany();
  const dbBrands = await prisma.brand.findMany();
  
  const products: Product[] = dbProducts.map((p) => ({
    ...p,
    brand: p.brandId as any,
    gender: p.gender as any,
    subcategory: p.subcategory as any,
    images: JSON.parse(p.images),
    notes: JSON.parse(p.notes),
    sizes: JSON.parse(p.sizes),
    tags: JSON.parse(p.tags),
    bottleColor: p.bottleColor as any,
    bottleMaterial: p.bottleMaterial as any,
    perfectSeason: p.perfectSeason as any,
    originalPrice: p.originalPrice ?? undefined,
  }));

  return (
    <div className="bg-[#fafaf7] text-[#1A1A1A] min-h-screen">
      <Header />

      <section className="pt-32 pb-8 lg:pt-40 lg:pb-12 border-b border-[#e0ddd4]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0ea5e9]">
            La Boutique
          </span>
          <h1 className="heading-font text-4xl lg:text-6xl mt-3 tracking-wide">
            Tous les parfums
          </h1>
          <p className="mt-4 text-[15px] text-[#6B6B6B] max-w-2xl leading-relaxed">
            {products.length} fragrances authentiques signées Valentino, Yves
            Saint Laurent et Emporio Armani. Livraison partout au Maroc avec 35Dh
            en 24-48h. Paiement à la livraison disponible.
          </p>

          {/* Quick category nav */}
          <div className="mt-8 flex flex-wrap gap-3">
            {MAIN_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/shop/${c.slug}`}
                className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#0ea5e9] border border-[#e0ddd4] hover:border-[#0ea5e9]/50 rounded-full px-5 py-2 transition-all"
              >
                {c.label}
              </Link>
            ))}
            <span className="w-px bg-[#e0ddd4] mx-2 self-stretch hidden sm:block" />
            {dbBrands.map((b) => (
              <Link
                key={b.slug}
                href={`/brands/${b.slug}`}
                className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#0ea5e9] border border-[#e0ddd4] hover:border-[#0ea5e9]/50 rounded-full px-5 py-2 transition-all"
              >
                {b.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <Suspense fallback={<div className="text-[#9A9A9A] text-sm">Chargement du catalogue…</div>}>
          <ShopCatalog products={products} brands={dbBrands} />
        </Suspense>
      </section>

      <Footer />
      <CartDrawer />
    </div>
  );
}
