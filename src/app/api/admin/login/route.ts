import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createAdminToken, seedDefaultOwnersIfEmpty } from '@/lib/auth/adminAuth';
import { logAdminActivity } from '@/lib/activityLogger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profileSlug = (body.profile || '').trim().toLowerCase();
    const userIdInput = (body.userId || '').trim();
    const emailInput = (body.email || body.username || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const rememberMe = Boolean(body.rememberMe ?? true);

    if (!password) {
      return NextResponse.json(
        { error: 'Veuillez saisir votre mot de passe pour déverrouiller ce profil.' },
        { status: 400 }
      );
    }

    // Ensure owners exist
    await seedDefaultOwnersIfEmpty();

    // 1. Find user in AdminUser table
    let user = null;

    if (userIdInput && !userIdInput.includes('fallback')) {
      user = await prisma.adminUser.findUnique({
        where: { id: userIdInput },
      });
    }

    if (!user && profileSlug) {
      user = await prisma.adminUser.findFirst({
        where: {
          OR: [
            { email: { startsWith: profileSlug, mode: 'insensitive' } },
            { name: { contains: profileSlug, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!user && emailInput) {
      user = await prisma.adminUser.findFirst({
        where: {
          OR: [
            { email: { equals: emailInput, mode: 'insensitive' } },
            { email: { startsWith: emailInput, mode: 'insensitive' } },
            { name: { contains: emailInput, mode: 'insensitive' } },
          ],
        },
      });
    }

    // Legacy fallback for "admin"
    if (!user && (emailInput === 'admin' || !emailInput)) {
      const config = await prisma.siteConfig.findFirst();
      const legacyPass = config?.adminPassword || 'nouamane2024';
      if (password === legacyPass) {
        user = await prisma.adminUser.findFirst({
          where: { role: 'OWNER' },
          orderBy: { createdAt: 'asc' },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Profil administrateur introuvable.' },
        { status: 404 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Ce profil administrateur est désactivé.' },
        { status: 403 }
      );
    }

    // 2. Verify password (matches bcrypt hash, or default NayParfum2026!, or master nouamane2024)
    let isMatch = await verifyPassword(password, user.passwordHash);
    
    if (!isMatch) {
      const config = await prisma.siteConfig.findFirst();
      const legacyPass = config?.adminPassword || 'nouamane2024';
      if (password === legacyPass || password === 'nouamane2024' || password === 'NayParfum2026!') {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect pour ' + user.name + '.' },
        { status: 401 }
      );
    }

    // 3. Update timestamps
    const now = new Date();
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        lastLoginAt: now,
        lastActivityAt: now,
      },
    });

    // 4. Create signed JWT
    const token = await createAdminToken(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      rememberMe
    );

    // 5. Activity log
    await logAdminActivity({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      description: `${user.name} a ouvert une session d'administration NAY Workspace.`,
      req: request,
    });

    // 6. Return response with Cookie
    const maxAgeSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 1;

    const response = NextResponse.json({
      success: true,
      message: `Bienvenue ${user.name} !`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        lastLoginAt: now,
      },
    });

    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la connexion.' },
      { status: 500 }
    );
  }
}
