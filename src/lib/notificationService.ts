import prisma from '@/lib/prisma';

export interface CreateNotificationParams {
  userId?: string | null; // null = broadcast to all owners/admins
  type: 'ORDER' | 'STOCK' | 'TASK' | 'REVIEW' | 'MESSAGE' | 'SYSTEM';
  title: string;
  message: string;
  link?: string | null;
  metadata?: any;
}

/**
 * Dispatch a real admin notification when an actual event occurs in the store
 */
export async function createAdminNotification(params: CreateNotificationParams) {
  try {
    return await prisma.adminNotification.create({
      data: {
        userId: params.userId || null,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        metadata: params.metadata ? (typeof params.metadata === 'string' ? params.metadata : JSON.stringify(params.metadata)) : null,
      },
    });
  } catch (error) {
    console.error('Failed to create admin notification:', error);
    return null;
  }
}
