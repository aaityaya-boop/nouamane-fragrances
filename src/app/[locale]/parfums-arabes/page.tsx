import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Parfums Arabes | NAY Parfums',
  description: 'Découvrez notre collection exclusive de parfums arabes. L\'essence de l\'Orient dans des flacons luxueux.',
};

export const dynamic = 'force-dynamic';

export default async function ArabicPerfumesPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  
  // Fetch all products marked as arabic
  const arabicPerfumes = await prisma.product.findMany({
    where: { subcategory: 'arabic', published: true },
    orderBy: { createdAt: 'desc' }
  });

  const parsedPerfumes = arabicPerfumes.map(c => {
    return {
      ...c,
      images: typeof c.images === 'string' ? JSON.parse(c.images) : c.images,
    };
  });

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1A1A1A] selection:bg-[#0ea5e9] selection:text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[65vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-[#f8fafc] z-10" />
        <div className="absolute inset-0 opacity-40">
           <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1620616164479-7a3a3028e332?q=80&w=2000')] bg-cover bg-center" />
        </div>
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6 opacity-0 animate-[fade-in-up_1s_ease-out_forwards]">
            <div className="h-[1px] w-12 bg-[#0ea5e9]"></div>
            <span className="text-[#0ea5e9] text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase">La Magie de l'Orient</span>
            <div className="h-[1px] w-12 bg-[#0ea5e9]"></div>
          </div>
          <h1 className="heading-font text-5xl md:text-7xl lg:text-8xl font-light mb-8 leading-tight opacity-0 animate-[fade-in-up_1s_ease-out_0.3s_forwards] text-[#1A1A1A]">
            Parfums Arabes
          </h1>
        </div>
      </section>

      {/* Perfumes Grid */}
      <section className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto">
        {parsedPerfumes.length === 0 ? (
          <div className="text-center py-20 text-[#6B6B6B]">
            <h2 className="heading-font text-3xl mb-4 text-[#0ea5e9]">Notre collection d'Orient arrive</h2>
            <p>Nos artisans préparent actuellement nos nouveaux parfums arabes.</p>
          </div>
        ) : (
          <div className="space-y-40">
            {parsedPerfumes.map((perfume, index) => (
              <div 
                key={perfume.id} 
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-24 relative`}
              >
                {/* Decorative floating element */}
                <div className={`absolute top-1/2 -translate-y-1/2 ${index % 2 === 1 ? 'left-0' : 'right-0'} text-[#0ea5e9]/5 text-[300px] font-serif italic -z-10 select-none`}>
                  O
                </div>

                {/* BIG Cover Image */}
                <div className="w-full lg:w-[55%] group relative">
                  <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-[2rem] bg-white border border-[#e0ddd4] shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0ea5e9]/20 via-transparent to-[#0ea5e9]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10 mix-blend-overlay" />
                    <Image
                      src={perfume.images[0] || '/images/placeholder.jpg'}
                      alt={perfume.name}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                    />
                  </div>
                  {/* Glowing Border Element */}
                  <div className="absolute -inset-2 border border-[#0ea5e9]/30 rounded-[2.5rem] -z-10 transform group-hover:scale-105 transition-transform duration-1000 group-hover:shadow-[0_0_40px_rgba(14,165,233,0.15)]" />
                </div>

                {/* Content */}
                <div className="w-full lg:w-[45%] flex flex-col justify-center">
                  <span className="text-[#0ea5e9] text-[11px] font-bold tracking-[0.3em] uppercase mb-4 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-[#0ea5e9]"></span>
                    {perfume.brandLabel || 'Essence Orientale'}
                  </span>
                  <h2 className="heading-font text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] mb-6 leading-tight">
                    {perfume.name}
                  </h2>
                  <div className="flex items-end gap-4 mb-8">
                    <div className="text-3xl text-[#1A1A1A] font-light">
                      {perfume.price} MAD
                    </div>
                    {perfume.originalPrice && (
                      <div className="text-gray-400 line-through text-lg mb-1">
                        {perfume.originalPrice} MAD
                      </div>
                    )}
                  </div>
                  <p className="text-[#6B6B6B] text-[15px] leading-relaxed mb-12 max-w-lg">
                    {perfume.description}
                  </p>
                  
                  <div>
                    <Link 
                      href={`/${locale}/product/${perfume.slug}`}
                      className="group/btn relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-12 font-bold tracking-[0.15em] text-[12px] uppercase bg-transparent border border-[#0ea5e9] text-[#0ea5e9] hover:text-white transition-all duration-300"
                    >
                      <span className="absolute inset-0 h-full w-full bg-[#0ea5e9] -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-out"></span>
                      <span className="relative flex items-center gap-3">
                        Découvrir ce Parfum
                        <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </span>
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
