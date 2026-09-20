import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from './auth/adminAuth';

export interface LogActivityParams {
  userId?: string;
  userName?: string;
  userEmail?: string;
  action: string;
  entityType: 'PRODUCT' | 'ORDER' | 'REVIEW' | 'CUSTOMER' | 'BRAND' | 'COFFRET' | 'MARKETING' | 'USER' | 'AUTH' | 'TASK' | 'SYSTEM';
  entityId?: string | number | null;
  description: string;
  oldValue?: any;
  newValue?: any;
  req?: Request;
  ipAddress?: string;
}

/**
 * Log an important admin action to the activity log table
 */
export async function logAdminActivity(params: LogActivityParams): Promise<void> {
  try {
    let userId = params.userId;
    let userName = params.userName;
    let userEmail = params.userEmail;

    // Auto-detect user if not provided
    if (!userId || !userName) {
      const currentAdmin = await getAuthenticatedAdmin(params.req);
      if (currentAdmin) {
        userId = userId || currentAdmin.id;
        userName = userName || currentAdmin.name;
        userEmail = userEmail || currentAdmin.email;
      }
    }

    const fallbackName = userName || 'Administrateur NAY';

    // Extract IP if req provided
    let ip = params.ipAddress;
    if (!ip && params.req) {
      ip = params.req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
           params.req.headers.get('x-real-ip') || undefined;
    }

    await prisma.adminActivityLog.create({
      data: {
        userId: userId || null,
        userName: fallbackName,
        userEmail: userEmail || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId !== undefined && params.entityId !== null ? String(params.entityId) : null,
        description: params.description,
        oldValue: params.oldValue ? (typeof params.oldValue === 'string' ? params.oldValue : JSON.stringify(params.oldValue)) : null,
        newValue: params.newValue ? (typeof params.newValue === 'string' ? params.newValue : JSON.stringify(params.newValue)) : null,
        ipAddress: ip || null,
      },
    });

    // Also update lastActivityAt for the user
    if (userId) {
      prisma.adminUser.update({
        where: { id: userId },
        data: { lastActivityAt: new Date() },
      }).catch(() => {}); // non-blocking
    }
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
}

/**
 * Fetch recent activity logs
 */
export async function getRecentAdminActivities(limit: number = 20, userId?: string) {
  try {
    const whereClause = userId ? { userId } : {};
    return await prisma.adminActivityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
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
    });
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    return [];
  }
}
