import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nayparfum.ma';

  const products = await prisma.product.findMany();
  const brands = await prisma.brand.findMany();
  const blogPosts = await prisma.blogPost.findMany({
    where: { published: true }
  });

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/fr/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const brandUrls = brands.map((brand) => ({
    url: `${baseUrl}/fr/brands/${brand.slug}`,
    lastModified: brand.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/fr/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}/fr`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/fr/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fr/master-copier`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fr/coffrets`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/fr/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
    ...brandUrls,
    ...blogUrls,
  ];
}
