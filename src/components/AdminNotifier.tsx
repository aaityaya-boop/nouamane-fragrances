'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  Sparkles,
  Info,
  X,
  ArrowRight,
  Volume2
} from 'lucide-react';

interface NotificationPayload {
  id: string;
  type: 'ORDER' | 'STOCK' | 'TASK' | 'MESSAGE' | 'SYSTEM' | string;
  title: string;
  message: string;
  link?: string | null;
  metadata?: any;
  createdAt?: string;
}

/**
 * Luxury Web Audio Chime (Synthesizes an elegant double bell chime)
 */
function playLuxuryChime(type = 'ORDER') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === 'ORDER') {
      // Elegant Dual Chime (E6 -> B6) with warm reverb decay
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1318.51, now); // E6
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Chime 2 (B6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1975.53, now + 0.12); // B6
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.4, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.9);
    } else {
      // Soft single chime (G5)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(783.99, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.warn('Audio chime playback note:', e);
  }
}

export default function AdminNotifier() {
  const router = useRouter();
  const [activeToast, setActiveToast] = useState<NotificationPayload | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seenNotifIds = useRef<Set<string>>(new Set());
  const isFirstSync = useRef(true);

  // Trigger Notification Locally
  const handleIncomingNotification = useCallback(
    (notif: NotificationPayload, playSound = true) => {
      if (!notif || !notif.id) return;
      if (seenNotifIds.current.has(notif.id)) return;
      seenNotifIds.current.add(notif.id);

      // Don't play loud sound on initial historical sync
      if (playSound && !isFirstSync.current) {
        playLuxuryChime(notif.type);

        // Native Desktop Notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            const nativeNotif = new Notification(notif.title, {
              body: notif.message,
              icon: '/images/nay/nay-logo-blue.png',
              tag: notif.id,
            });
            nativeNotif.onclick = () => {
              window.focus();
              if (notif.link) router.push(notif.link);
            };
          } catch (err) {}
        }

        // Show Luxury Floating Toast
        setActiveToast(notif);
        setToastVisible(true);

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setToastVisible(false);
        }, 7000);
      }

      // Dispatch global window event for header & notifications page
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('nay_new_notification', { detail: notif })
        );
      }
    },
    [router]
  );

  useEffect(() => {
    // 1. Request Native Notification Permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().catch(() => {});
      }
    }

    // 2. BroadcastChannel across all browser tabs
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('nay_admin_notifs');
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'NOTIF') {
          handleIncomingNotification(event.data.payload, false);
        }
      };
    } catch (e) {}

    // 3. Setup Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/admin/notifications/stream');

        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'NOTIFICATION' && parsed.data) {
              handleIncomingNotification(parsed.data, true);
              // Broadcast to other tabs
              broadcastChannel?.postMessage({ type: 'NOTIF', payload: parsed.data });
            }
          } catch (err) {}
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Try reconnect in 5 seconds
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.error('SSE initialization error:', err);
      }
    };

    connectSSE();

    // 4. Fast Delta Polling (3 seconds) as bulletproof backup
    const fastPoll = async () => {
      try {
        const res = await fetch('/api/admin/notifications?limit=5&unreadOnly=true');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.notifications)) {
            data.notifications.forEach((notif: NotificationPayload) => {
              if (!seenNotifIds.current.has(notif.id)) {
                handleIncomingNotification(notif, true);
              }
            });
          }
        }
      } catch (err) {} finally {
        isFirstSync.current = false;
      }
    };

    // Initial check
    fastPoll();
    const pollInterval = setInterval(fastPoll, 3000);

    // Heartbeat every 30s
    const heartbeat = setInterval(() => {
      fetch('/api/admin/auth/heartbeat', { method: 'POST' }).catch(() => {});
    }, 30000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(heartbeat);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (eventSource) eventSource.close();
      if (broadcastChannel) broadcastChannel.close();
    };
  }, [handleIncomingNotification]);

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <ShoppingBag size={20} />
          </div>
        );
      case 'STOCK':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <AlertTriangle size={20} />
          </div>
        );
      case 'TASK':
        return (
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
            <CheckSquare size={20} />
          </div>
        );
      case 'MESSAGE':
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
            <MessageSquare size={20} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles size={20} />
          </div>
        );
    }
  };

  return (
    <>
      {/* Interactive Luxury Floating Toast Banner */}
      {activeToast && (
        <div
          className={`fixed top-5 right-5 z-[99999] max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-neutral-200/90 p-4 transform transition-all duration-300 ease-out ${
            toastVisible
              ? 'translate-y-0 opacity-100 scale-100'
              : '-translate-y-8 opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="flex items-start gap-3">
            {getToastIcon(activeToast.type)}

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  En Direct • Instantané
                </span>
                <button
                  onClick={() => setToastVisible(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <h4 className="font-bold text-xs text-neutral-900 leading-snug">
                {activeToast.title}
              </h4>
              <p className="text-neutral-500 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                {activeToast.message}
              </p>

              {activeToast.link && (
                <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <Link
                    href={activeToast.link}
                    onClick={() => setToastVisible(false)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 hover:text-emerald-600 transition-colors"
                  >
                    <span>Consulter maintenant</span>
                    <ArrowRight size={12} />
                  </Link>

                  <span className="text-[10px] text-neutral-400">À l'instant</span>
                </div>
              )}
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-100 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-7000 ease-linear"
              style={{ width: toastVisible ? '100%' : '0%' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
