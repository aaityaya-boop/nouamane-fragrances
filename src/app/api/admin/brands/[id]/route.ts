import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { name, label, description, image } = await req.json();

    const updated = await prisma.brand.update({
      where: { id: (await params).id },
      data: { 
        name, 
        label, 
        description, 
        image: image || undefined 
      }
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if there are products linked to this brand
    const linkedProducts = await prisma.product.count({
      where: { brand: { id } }
    });
    
    if (linkedProducts > 0) {
      return NextResponse.json({ error: "Impossible de supprimer cette marque car des produits y sont associés." }, { status: 400 });
    }

    await prisma.brand.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
