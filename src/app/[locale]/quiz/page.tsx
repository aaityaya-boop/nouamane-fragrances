import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import PerfumeQuiz from '@/components/PerfumeQuiz';
import prisma from '@/lib/prisma';
import { Product } from '@/lib/products';

export const metadata = {
  title: 'Quiz Parfum : Trouvez Votre Signature | NAY Parfums',
  description: 'Faites notre quiz interactif pour trouver le parfum qui correspond parfaitement à votre personnalité et à vos goûts.',
};

export const revalidate = 3600;

export default async function QuizPage() {
  const dbProducts = await prisma.product.findMany({
    where: {
      inStock: true,
      subcategory: { notIn: ['master-copier', 'coffrets'] }
    }
  });

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
    <div className="bg-[#fafaf7] text-[#1A1A1A] min-h-screen relative overflow-hidden flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 lg:pt-32 pb-16 relative z-10 flex flex-col">
        <PerfumeQuiz products={products} />
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
