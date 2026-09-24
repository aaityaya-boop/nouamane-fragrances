import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createAmbassadorToken } from '@/lib/affiliate-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Veuillez saisir votre adresse e-mail et votre mot de passe.' },
        { status: 400 }
      );
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!affiliate || !affiliate.passwordHash) {
      return NextResponse.json(
        { error: 'Identifiants invalides ou compte ambassadeur non configuré.' },
        { status: 401 }
      );
    }

    if (affiliate.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Ce compte ambassadeur est actuellement inactif ou suspendu. Contactez la direction NAY.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, affiliate.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect.' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session token
    const token = await createAmbassadorToken({
      id: affiliate.id,
      email: affiliate.email || '',
      code: affiliate.code,
      name: affiliate.name,
    });

    const response = NextResponse.json({
      success: true,
      ambassador: {
        id: affiliate.id,
        name: affiliate.name,
        code: affiliate.code,
        email: affiliate.email,
      },
    });

    response.cookies.set('ambassador_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Ambassador login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
