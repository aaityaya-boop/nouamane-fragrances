import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { getUserEffectivePermissions } from '@/lib/auth/rbac/accessControl';
import { getRoleDefinition } from '@/lib/auth/rbac/roles';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const effectivePermissions = getUserEffectivePermissions(admin);
    const roleDefinition = getRoleDefinition(admin.role);
    const isOwner = admin.role === 'OWNER' || admin.role === 'CO_OWNER' || admin.role === 'SUPER_ADMIN';

    // Also get active team members list for presence / chat
    const teamMembers = await prisma.adminUser.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
        avatar: true,
        lastLoginAt: true,
        lastActivityAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...admin,
        roleDefinition,
        effectivePermissions,
        isOwner,
      },
      teamMembers,
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
