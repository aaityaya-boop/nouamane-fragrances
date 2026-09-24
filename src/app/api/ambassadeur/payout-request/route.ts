import { NextResponse } from 'next/server';
import { getCurrentAmbassador } from '@/lib/affiliate-auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const ambassador = await getCurrentAmbassador();
    if (!ambassador) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, note, bankRib } = body;

    const availableBalance = Math.max(0, ambassador.commissionEarned - ambassador.commissionPaid);

    if (amount <= 0 || amount > availableBalance) {
      return NextResponse.json(
        { error: 'Montant invalide ou supérieur au solde disponible.' },
        { status: 400 }
      );
    }

    // Create an admin notification for payout request
    try {
      await prisma.adminNotification.create({
        data: {
          type: 'SYSTEM',
          title: `Demande de Virement Ambassadeur: ${ambassador.name}`,
          message: `${ambassador.name} (@${ambassador.code}) demande un virement de ${amount} MAD. RIB: ${bankRib || ambassador.bankRib || 'Non renseigné'}`,
          link: `/admin/affiliates/${ambassador.id}`,
          metadata: JSON.stringify({ affiliateId: ambassador.id, amount, note }),
        },
      });
    } catch (notifErr) {
      console.error('Failed to notify admin of payout request:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Votre demande de paiement a été envoyée avec succès à la direction financière NAY.',
    });
  } catch (error) {
    console.error('Error creating payout request:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
