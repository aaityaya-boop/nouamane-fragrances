import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, canManageUser } from '@/lib/auth/rbac/accessControl';
import { logAdminActivity } from '@/lib/activityLogger';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/admin/team/[id]/reset-permissions - Reset custom permissions to role default
export async function POST(req: Request, context: RouteContext) {
  try {
    const { user: currentAdmin, errorResponse } = await requirePermission(req, 'team.manage_permissions');
    if (errorResponse) return errorResponse;

    const { id } = await context.params;

    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Collaborateur introuvable' },
        { status: 404 }
      );
    }

    const managementCheck = canManageUser(currentAdmin!, {
      id: targetUser.id,
      role: targetUser.role,
    });

    if (!managementCheck.allowed) {
      return NextResponse.json(
        { error: managementCheck.reason || 'Action non autorisée' },
        { status: 403 }
      );
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: { customPermissions: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customPermissions: true,
      },
    });

    await logAdminActivity({
      req,
      userId: currentAdmin?.id,
      userName: currentAdmin?.name,
      userEmail: currentAdmin?.email,
      action: 'RESET_TEAM_PERMISSIONS',
      entityType: 'USER',
      entityId: updated.id,
      description: `Réinitialisation des permissions personnalisées de "${updated.name}" vers les valeurs par défaut du rôle ${updated.role}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Permissions réinitialisées aux valeurs par défaut du rôle',
      member: updated,
    });
  } catch (error) {
    console.error('Error resetting permissions:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la réinitialisation des permissions' },
      { status: 500 }
    );
  }
}
