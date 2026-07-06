import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const configCount = await prisma.siteConfig.count();
    
    if (configCount === 0) {
      await prisma.siteConfig.create({
        data: {
          adminPassword: "nouamane2024",
          shippingFee: 35,
          contactPhone: "+212 5 35 63 42 18",
          contactEmail: "contact@nouamane.ma",
          heroTitle: "L'Essence de l'Élégance",
          heroSubtitle: "Découvrez notre collection de parfums de luxe, conçue pour laisser une empreinte inoubliable.",
        }
      });
      return NextResponse.json({ success: true, message: "Site config seeded" });
    }
    
    return NextResponse.json({ success: true, message: "Site config already exists" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to seed site config' }, { status: 500 });
  }
}
