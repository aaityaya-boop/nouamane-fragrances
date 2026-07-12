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

export default async function CoffretsPage({ params: { locale } }: { params: { locale: string } }) {
  // Fetch all products marked as coffrets
  const coffrets = await prisma.product.findMany({
    where: { subcategory: 'coffrets' },
    orderBy: { createdAt: 'desc' }
  });

  // Parse images for each coffret
  const parsedCoffrets = coffrets.map(c => ({
    ...c,
    images: typeof c.images === 'string' ? JSON.parse(c.images) : c.images
  }));

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
                  <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-lg">
                    {coffret.description}
                  </p>
                  
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
