import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { REVIEWS } from '@/lib/reviews';

export async function POST() {
  try {
    let count = 0;
    
    for (const review of REVIEWS) {
      // Check if product exists before creating review to avoid foreign key errors
      const productExists = await prisma.product.findUnique({
        where: { slug: review.productSlug }
      });
      
      if (productExists) {
        await prisma.review.create({
          data: {
            productSlug: review.productSlug,
            author: review.author,
            city: review.city,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            verified: review.verified,
            createdAt: new Date(review.createdAt),
          }
        });
        count++;
      }
    }

    return NextResponse.json({ success: true, message: `Seeded ${count} reviews` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to seed reviews' }, { status: 500 });
  }
}
