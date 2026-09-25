import prisma from '@/lib/prisma';
import { broadcastNewNotification } from './realtimeEvents';

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
    const created = await prisma.adminNotification.create({
      data: {
        userId: params.userId || null,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        metadata: params.metadata
          ? typeof params.metadata === 'string'
            ? params.metadata
            : JSON.stringify(params.metadata)
          : null,
      },
    });

    // Broadcast instantly to all connected admin SSE clients
    broadcastNewNotification(created);

    return created;
  } catch (error) {
    console.error('Failed to create admin notification:', error);
    return null;
  }
}
