/**
 * Helper to compute real online status and French last seen text
 */

export function isUserOnline(lastActivityAt?: string | Date | null): boolean {
  if (!lastActivityAt) return false;
  const time = new Date(lastActivityAt).getTime();
  const now = Date.now();
  // User is online if active within the last 2 minutes (120,000ms)
  return now - time < 120000;
}

export function formatLastSeen(
  lastActivityAt?: string | Date | null,
  lastLoginAt?: string | Date | null
): { isOnline: boolean; text: string; statusColor: string } {
  const timestamp = lastActivityAt || lastLoginAt;
  if (!timestamp) {
    return {
      isOnline: false,
      text: 'Jamais connecté',
      statusColor: 'text-slate-400',
    };
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Online (within 2 minutes)
  if (diffInSeconds < 120) {
    return {
      isOnline: true,
      text: 'En ligne',
      statusColor: 'text-emerald-500',
    };
  }

  // Active less than an hour ago
  if (diffInSeconds < 3600) {
    const mins = Math.max(1, Math.floor(diffInSeconds / 60));
    return {
      isOnline: false,
      text: `Vu(e) il y a ${mins} min`,
      statusColor: 'text-slate-400',
    };
  }

  // Active today
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    const timeStr = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      isOnline: false,
      text: `Vu(e) aujourd'hui à ${timeStr}`,
      statusColor: 'text-slate-400',
    };
  }

  // Active yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    const timeStr = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      isOnline: false,
      text: `Vu(e) hier à ${timeStr}`,
      statusColor: 'text-slate-400',
    };
  }

  // Older
  const dateStr = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
  const timeStr = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    isOnline: false,
    text: `Vu(e) le ${dateStr} à ${timeStr}`,
    statusColor: 'text-slate-400',
  };
}
