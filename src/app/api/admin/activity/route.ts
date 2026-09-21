import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { hasPermission } from '@/lib/auth/rbac/accessControl';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // RBAC: Only Owners and users with 'activity.view_all' can access the global activity audit log
    const canViewAll = admin.isOwner || hasPermission(admin, 'activity.view_all');
    if (!canViewAll) {
      return NextResponse.json({
        success: false,
        error: 'Accès refusé. Le journal d\'activité global est réservé aux administrateurs et responsables.',
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '30', 10), 1), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const userId = searchParams.get('userId') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const action = searchParams.get('action') || undefined;
    const search = searchParams.get('search') || undefined;
    const period = searchParams.get('period') || 'ALL'; // TODAY, WEEK, MONTH, ALL

    const where: any = {};

    if (userId && userId !== 'ALL') {
      if (userId === 'SYSTEM') {
        where.userId = null;
      } else {
        where.userId = userId;
      }
    }

    if (entityType && entityType !== 'ALL') {
      where.entityType = entityType;
    }

    if (action && action !== 'ALL') {
      where.action = action;
    }

    // Time filter
    if (period === 'TODAY') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      where.createdAt = { gte: todayStart };
    } else if (period === 'WEEK') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      where.createdAt = { gte: weekStart };
    } else if (period === 'MONTH') {
      const monthStart = new Date();
      monthStart.setDate(monthStart.getDate() - 30);
      where.createdAt = { gte: monthStart };
    }

    if (search && search.trim()) {
      where.OR = [
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { userName: { contains: search.trim(), mode: 'insensitive' } },
        { action: { contains: search.trim(), mode: 'insensitive' } },
        { entityType: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Compute stats for overview cards
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, logs, todayTotal, allUsers] = await Promise.all([
      prisma.adminActivityLog.count({ where }),
      prisma.adminActivityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
      }),
      prisma.adminActivityLog.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.adminUser.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, email: true, avatar: true },
      }),
    ]);

    // Calculate count per user for the overview
    const userStats = await prisma.adminActivityLog.groupBy({
      by: ['userName'],
      _count: { _all: true },
      where: { createdAt: { gte: todayStart } },
    });

    return NextResponse.json({
      success: true,
      logs,
      stats: {
        total,
        todayTotal,
        todayByUser: userStats.map((u) => ({ name: u.userName, count: u._count._all })),
      },
      users: allUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin activity logs:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des activités' }, { status: 500 });
  }
}
