import { EventEmitter } from 'events';

// Global singleton EventEmitter for Next.js server runtime
declare global {
  var __nayNotificationEmitter: EventEmitter | undefined;
}

if (!global.__nayNotificationEmitter) {
  global.__nayNotificationEmitter = new EventEmitter();
  global.__nayNotificationEmitter.setMaxListeners(200);
}

export const notificationEmitter = global.__nayNotificationEmitter;

export function broadcastNewNotification(notification: any) {
  try {
    notificationEmitter.emit('notification', notification);
  } catch (err) {
    console.error('Failed to emit realtime notification:', err);
  }
}
