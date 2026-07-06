import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { ArrowLeft, ArrowRight, Truck } from 'lucide-react';
import { PRODUCTS, formatMAD } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  
  if (!post) return { title: 'Article non trouvé' };

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.coverImage],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const post = await prisma.blogPost.findUnique({
    where: { slug }
  });

  if (!post || post.status !== 'published') {
    notFound();
  }

  // Parse related products
  let relatedSlugs: string[] = [];
  try {
    relatedSlugs = JSON.parse(post.relatedProductSlugs);
  } catch (e) {}

  const relatedProducts = PRODUCTS.filter(p => relatedSlugs.includes(p.slug));

  const createMarkup = () => {
    return { __html: post.content };
  };

  return (
    <div className="bg-[#fafaf7] text-[#1A1A1A] min-h-screen">
      <Header />
      
      <main className="pt-28 lg:pt-36 pb-24">
        <div className="max-w-[800px] mx-auto px-6">
          
          <Link href="/blog" className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors mb-10">
            <ArrowLeft size={14} /> Retour au Mag
          </Link>

          <div className="text-center mb-12">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0ea5e9] mb-4 block">
              Par {post.author} · {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <h1 className="heading-font text-4xl lg:text-6xl leading-[1.1] mb-6">
              {post.title}
            </h1>
            <p className="text-[18px] lg:text-[20px] text-[#6B6B6B] leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-16 shadow-lg">
            <Image 
              src={post.coverImage} 
              alt={post.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>

          <article 
            className="prose prose-lg lg:prose-xl max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-[#0ea5e9] prose-img:rounded-xl mb-20"
            dangerouslySetInnerHTML={createMarkup()}
          />
          
        </div>

        {/* RELATED PRODUCTS (MARKETING FEATURE) */}
        {relatedProducts.length > 0 && (
          <div className="bg-white border-y border-gray-100 py-20 mt-10">
            <div className="max-w-[1200px] mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="heading-font text-3xl lg:text-4xl mb-4">Parfums mentionnés dans cet article</h2>
                <div className="w-12 h-0.5 bg-[#0ea5e9] mx-auto"></div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[900px] mx-auto">
                {relatedProducts.map((product) => (
                  <Link href={`/shop/product/${product.slug}`} key={product.id} className="group block bg-[#fafaf7] rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-square w-full mb-6 rounded-xl overflow-hidden bg-white">
                      <Image 
                        src={product.images[0]} 
                        alt={product.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A] mb-2">{product.brandLabel}</div>
                    <h3 className="heading-font text-xl mb-4 group-hover:text-[#0ea5e9] transition-colors">{product.name}</h3>
                    
                    <div className="flex items-end justify-between">
                      <div className="flex items-end gap-3">
                        <span className="text-xl font-bold text-[#1A1A1A]">{formatMAD(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-[#9A9A9A] line-through mb-1">{formatMAD(product.originalPrice)}</span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A1A1A] group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors shadow-sm">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
