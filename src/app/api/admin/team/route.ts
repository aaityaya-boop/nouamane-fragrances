import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/adminAuth';
import { getUserEffectivePermissions } from '@/lib/auth/rbac/accessControl';
import { requirePermission } from '@/lib/auth/rbac/serverGuard';
import { getRoleDefinition } from '@/lib/auth/rbac/roles';
import { logAdminActivity } from '@/lib/activityLogger';

// GET /api/admin/team - List team members
export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requirePermission(req, 'team.view');
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const department = searchParams.get('department') || '';

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    const members = await prisma.adminUser.findMany({
      where,
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
        phone: true,
        status: true,
        avatar: true,
        customPermissions: true,
        lastLoginAt: true,
        lastActivityAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedTasks: true,
            createdTasks: true,
            activities: true,
          },
        },
      },
    });

    const now = new Date().getTime();

    // Enrich with computed metadata
    const enrichedMembers = members.map((member) => {
      const roleDef = getRoleDefinition(member.role);
      const effectivePermissions = getUserEffectivePermissions(member);
      
      // Online presence heuristic (active in last 3 minutes)
      const lastAct = member.lastActivityAt ? new Date(member.lastActivityAt).getTime() : 0;
      const isOnline = (now - lastAct) < 3 * 60 * 1000;

      return {
        ...member,
        roleDefinition: roleDef,
        effectivePermissionsCount: effectivePermissions.length,
        isOnline,
      };
    });

    // Optional department filter in memory
    const filtered = department
      ? enrichedMembers.filter((m) => m.roleDefinition.department === department)
      : enrichedMembers;

    // Summary statistics
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === 'ACTIVE').length;
    const disabledMembers = members.filter((m) => m.status === 'DISABLED').length;
    const onlineMembers = enrichedMembers.filter((m) => m.isOnline).length;

    return NextResponse.json({
      success: true,
      members: filtered,
      stats: {
        total: totalMembers,
        active: activeMembers,
        disabled: disabledMembers,
        online: onlineMembers,
      },
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des membres' },
      { status: 500 }
    );
  }
}

// POST /api/admin/team - Create a new team member
export async function POST(req: Request) {
  try {
    const { user: currentAdmin, errorResponse } = await requirePermission(req, 'team.create');
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { name, email, password, role = 'GUEST_VIEWER', jobTitle, phone, avatar, customPermissions } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, adresse email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailNormalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalized)) {
      return NextResponse.json(
        { error: 'Format d\'adresse email invalide' },
        { status: 400 }
      );
    }

    // Password strength check
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existing = await prisma.adminUser.findUnique({
      where: { email: emailNormalized },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Cette adresse email est déjà utilisée par un autre collaborateur' },
        { status: 400 }
      );
    }

    // Privilege elevation check: Only Owners can create an OWNER account
    const isOwner = currentAdmin?.role === 'OWNER' || currentAdmin?.role === 'CO_OWNER';
    if ((role === 'OWNER' || role === 'CO_OWNER') && !isOwner) {
      return NextResponse.json(
        { error: 'Seuls les Propriétaires actuels peuvent créer un autre compte Propriétaire' },
        { status: 403 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Format customPermissions if provided
    let customPermsString: string | null = null;
    if (customPermissions && typeof customPermissions === 'object') {
      customPermsString = JSON.stringify(customPermissions);
    }

    const newMember = await prisma.adminUser.create({
      data: {
        name: name.trim(),
        email: emailNormalized,
        passwordHash,
        role: role.toUpperCase(),
        jobTitle: jobTitle ? jobTitle.trim() : null,
        phone: phone ? phone.trim() : null,
        avatar: avatar || null,
        status: 'ACTIVE',
        customPermissions: customPermsString,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
        phone: true,
        status: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Audit log
    await logAdminActivity({
      req,
      userId: currentAdmin?.id,
      userName: currentAdmin?.name,
      userEmail: currentAdmin?.email,
      action: 'CREATE_TEAM_MEMBER',
      entityType: 'USER',
      entityId: newMember.id,
      description: `Création du compte collaborateur pour "${newMember.name}" avec le rôle ${newMember.role}`,
      newValue: { name: newMember.name, email: newMember.email, role: newMember.role, jobTitle: newMember.jobTitle },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Compte collaborateur créé avec succès',
        member: newMember,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    );
  }
}
