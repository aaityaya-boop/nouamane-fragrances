import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        published: true
      },
      include: {
        brand: true
      }
    });

    const siteUrl = 'https://nayparfum.ma';

    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>NAY Parfum</title>
    <link>${siteUrl}</link>
    <description>Parfumerie en ligne - Master Copies et Décants au Maroc</description>
`;

    products.forEach((product) => {
      // Handle images (get the first one, ensure absolute URL)
      const imagesArray = product.images.split(',');
      let mainImage = imagesArray[0].trim();
      if (mainImage.startsWith('/')) {
        mainImage = `${siteUrl}${mainImage}`;
      }
      
      // Google Merchant XML requires valid URLs (no spaces)
      mainImage = encodeURI(mainImage);

      // Format description to be plain text without HTML tags for Google if needed, though basic HTML is okay.
      const description = product.description.replace(/<[^>]*>?/gm, '').substring(0, 5000);

      // Condition and Availability
      const availability = product.inStock && product.stock > 0 ? 'in_stock' : 'out_of_stock';
      
      // We use product ID as the required g:id
      const id = product.sku || product.id.toString();

      xml += `    <item>
      <g:id>${id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link><![CDATA[${siteUrl}/fr/product/${product.slug}]]></g:link>
      <g:image_link><![CDATA[${mainImage}]]></g:image_link>
      <g:brand><![CDATA[${product.brandLabel}]]></g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${product.price} MAD</g:price>
      <g:identifier_exists>no</g:identifier_exists>
    </item>
`;
    });

    xml += `  </channel>\n</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating Google feed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
