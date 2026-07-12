import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Nos Éditions Spéciales & Coffrets Cadeaux | Nouamane Parfums',
  description: 'Découvrez nos coffrets cadeaux et éditions spéciales. Une expérience olfactive luxueuse conçue pour émerveiller.',
};

export default async function CoffretsPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  // Fetch all products marked as coffrets
  // Fetch all products marked as coffrets
  const coffrets = await prisma.product.findMany({
    where: { subcategory: 'coffrets' },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch all standard products to display included items
  const standardProducts = await prisma.product.findMany({
    where: { subcategory: { not: 'coffrets' } }
  });

  // Parse images and tags for each coffret
  const parsedCoffrets = coffrets.map(c => {
    const tags = typeof c.tags === 'string' ? JSON.parse(c.tags) : c.tags;
    
    // Find the actual product objects that are included in this coffret
    const includedProducts = (tags || []).map((slug: string) => {
      const p = standardProducts.find(sp => sp.slug === slug);
      if (p) {
        return {
          ...p,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
        };
      }
      return null;
    }).filter(Boolean);

    return {
      ...c,
      images: typeof c.images === 'string' ? JSON.parse(c.images) : c.images,
      includedProducts
    };
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a] z-10" />
        <div className="absolute inset-0 opacity-40">
           {/* Abstract gold dust background */}
           <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070')] bg-cover bg-center" />
        </div>
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <span className="text-[#D4AF37] text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-6 block">L'Art d'Offrir</span>
          <h1 className="heading-font text-5xl md:text-7xl font-light mb-8 leading-tight">
            Éditions Spéciales <br/> <span className="italic font-serif text-[#D4AF37]">& Coffrets</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Une sélection prestigieuse de nos fragrances les plus convoitées, réunies dans des écrins luxueux. Offrez l'inoubliable.
          </p>
        </div>
      </section>

      {/* Coffrets Grid - Zig Zag Layout */}
      <section className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto">
        {parsedCoffrets.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <h2 className="heading-font text-3xl mb-4">La collection arrive bientôt</h2>
            <p>Nos artisans préparent actuellement nos nouveaux coffrets de luxe.</p>
          </div>
        ) : (
          <div className="space-y-32">
            {parsedCoffrets.map((coffret, index) => (
              <div 
                key={coffret.id} 
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-32`}
              >
                {/* BIG Cover Image */}
                <div className="w-full lg:w-1/2 group relative">
                  <div className="relative aspect-[4/5] md:aspect-[4/4] overflow-hidden rounded-2xl bg-[#111]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-overlay" />
                    <Image
                      src={coffret.images[0] || '/images/placeholder.jpg'}
                      alt={coffret.name}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -inset-4 border border-[#D4AF37]/20 rounded-2xl -z-10 transform group-hover:scale-[1.02] transition-transform duration-700" />
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                    {coffret.brandLabel || 'Nouamane Édition'}
                  </span>
                  <h2 className="heading-font text-4xl md:text-5xl lg:text-6xl text-white mb-6">
                    {coffret.name}
                  </h2>
                  <div className="text-2xl text-white mb-8 font-light">
                    {coffret.price} MAD
                    {coffret.originalPrice && (
                      <span className="text-gray-600 line-through text-lg ml-4">
                        {coffret.originalPrice} MAD
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-lg">
                    {coffret.description}
                  </p>
                  
                  {coffret.includedProducts && coffret.includedProducts.length > 0 && (
                    <div className="mb-10">
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-4 font-bold border-b border-gray-800 pb-2">Ce coffret inclut :</div>
                      <div className="flex flex-col gap-3">
                        {coffret.includedProducts.map((p: any) => (
                          <Link href={`/${locale}/product/${p.slug}`} key={p.id} className="flex items-center gap-4 group/item">
                            <div className="w-12 h-12 relative rounded-md overflow-hidden bg-[#111] border border-gray-800 group-hover/item:border-[#D4AF37] transition-colors">
                              {p.images && p.images[0] && (
                                <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white group-hover/item:text-[#D4AF37] transition-colors">{p.name}</div>
                              <div className="text-xs text-gray-500">{p.brandLabel}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6">
                    <Link 
                      href={`/${locale}/product/${coffret.slug}`}
                      className="bg-white text-black px-10 py-4 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                    >
                      Découvrir le coffret
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
