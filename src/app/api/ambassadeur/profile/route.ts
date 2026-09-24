import { NextResponse } from 'next/server';
import { getCurrentAmbassador, hashPassword } from '@/lib/affiliate-auth';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const ambassador = await getCurrentAmbassador();
    if (!ambassador) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      code,
      phone,
      instagram,
      tiktok,
      avatar,
      bankName,
      bankAccountName,
      bankRib,
      cinNumber,
      newPassword,
    } = body;

    const updateData: any = {};

    if (name && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    // Handle code / VIP link update
    if (code && code.trim().length > 0) {
      const cleanCode = code.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
      if (cleanCode !== ambassador.code) {
        // Check if code is already taken by another affiliate
        const existing = await prisma.affiliate.findUnique({
          where: { code: cleanCode },
        });
        if (existing && existing.id !== ambassador.id) {
          return NextResponse.json(
            { error: `Le code VIP "/vip/${cleanCode}" est déjà réservé par un autre partenaire.` },
            { status: 400 }
          );
        }
        updateData.code = cleanCode;
      }
    }

    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (instagram !== undefined) updateData.instagram = instagram ? instagram.trim().replace(/^@/, '') : null;
    if (tiktok !== undefined) updateData.tiktok = tiktok ? tiktok.trim().replace(/^@/, '') : null;
    if (avatar !== undefined) updateData.avatar = avatar ? avatar.trim() : null;

    if (bankName !== undefined) updateData.bankName = bankName ? bankName.trim() : null;
    if (bankAccountName !== undefined) updateData.bankAccountName = bankAccountName ? bankAccountName.trim() : null;
    if (bankRib !== undefined) updateData.bankRib = bankRib ? bankRib.trim() : null;
    if (cinNumber !== undefined) updateData.cinNumber = cinNumber ? cinNumber.trim() : null;

    if (newPassword && newPassword.trim().length >= 6) {
      updateData.passwordHash = await hashPassword(newPassword.trim());
    }

    const updated = await prisma.affiliate.update({
      where: { id: ambassador.id },
      data: updateData,
    });

    const { passwordHash, ...safeUpdated } = updated;

    return NextResponse.json({
      success: true,
      ambassador: safeUpdated,
      message: 'Vos informations et coordonnées ont été mises à jour avec succès !',
    });
  } catch (error: any) {
    console.error('Error updating ambassador profile:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
