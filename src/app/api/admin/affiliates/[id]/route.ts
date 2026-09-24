import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { hashPassword } from '@/lib/affiliate-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        leadsList: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        clicks: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        payouts: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Ambassadeur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(affiliate);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const {
      name,
      code,
      email,
      password,
      phone,
      instagram,
      tiktok,
      status,
      commissionType,
      commissionRate,
      fixedPerOrder,
      payPerVisit,
      payPerLead,
      monthlyRetainer,
      paymentMethod,
      bankName,
      bankAccountName,
      bankRib,
      cinNumber,
    } = data;

    const updateData: any = {
      name: name?.trim(),
      code: code ? code.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '') : undefined,
      email: email ? email.toLowerCase().trim() : null,
      phone: phone ? phone.trim() : null,
      instagram: instagram ? instagram.trim().replace(/^@/, '') : null,
      tiktok: tiktok ? tiktok.trim().replace(/^@/, '') : null,
      status: status || 'ACTIVE',

      commissionType: commissionType || 'PERCENTAGE',
      commissionRate: commissionRate !== undefined ? Number(commissionRate) : 10,
      fixedPerOrder: fixedPerOrder !== undefined ? Number(fixedPerOrder) : 0,
      payPerVisit: payPerVisit !== undefined ? Number(payPerVisit) : 0,
      payPerLead: payPerLead !== undefined ? Number(payPerLead) : 0,
      monthlyRetainer: monthlyRetainer !== undefined ? Number(monthlyRetainer) : 0,

      paymentMethod: paymentMethod || 'VIREMENT_BANCAIRE',
      bankName: bankName ? bankName.trim() : null,
      bankAccountName: bankAccountName ? bankAccountName.trim() : null,
      bankRib: bankRib ? bankRib.trim() : null,
      cinNumber: cinNumber ? cinNumber.trim() : null,
    };

    // If new password provided, hash it
    if (password && password.trim().length > 0) {
      updateData.passwordHash = await hashPassword(password.trim());
    }

    const updated = await prisma.affiliate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, affiliate: updated });
  } catch (error: any) {
    console.error('Error updating affiliate:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await prisma.affiliate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
