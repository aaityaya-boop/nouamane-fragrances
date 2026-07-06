import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const { author, city, rating, title, comment } = body;

    if (!author || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { slug }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create review
    await prisma.review.create({
      data: {
        productSlug: slug,
        author,
        city: city || 'Maroc',
        rating: parseInt(rating, 10),
        title,
        comment,
      }
    });

    // Update product rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productSlug: slug }
    });

    const newReviewCount = allReviews.length;
    const newRating = newReviewCount > 0 
      ? allReviews.reduce((acc, rev) => acc + rev.rating, 0) / newReviewCount
      : 0;

    await prisma.product.update({
      where: { slug },
      data: {
        rating: Math.round(newRating * 10) / 10, // Round to 1 decimal place
        reviewCount: newReviewCount
      }
    });

    return NextResponse.json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
