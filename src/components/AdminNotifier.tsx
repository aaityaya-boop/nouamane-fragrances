'use client';

import { useEffect, useState, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';

// Web Audio API to play a "Cha-Ching" / Coin sound without external files
function playChaChing() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Ding 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1500, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(2500, ctx.currentTime + 0.1);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.5);

    // Ding 2
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2500, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(3500, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.5);
    }, 120);
  } catch (e) {
    console.error('Audio play failed', e);
  }
}

export default function AdminNotifier() {
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [latestOrderInfo, setLatestOrderInfo] = useState<{ name: string; amount: number; id: string } | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Request permission for native notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }

    const checkLatestOrder = async () => {
      try {
        const res = await fetch('/api/admin/orders/latest');
        if (!res.ok) return;
        const data = await res.json();
        
        if (data && data.order) {
          const currentOrderId = data.order.id;
          
          if (isFirstLoad.current) {
            setLastOrderId(currentOrderId);
            isFirstLoad.current = false;
            return;
          }

          if (lastOrderId && currentOrderId !== lastOrderId) {
            // NEW ORDER DETECTED
            setLastOrderId(currentOrderId);
            setLatestOrderInfo({
              name: data.order.customerName,
              amount: data.order.total,
              id: data.order.orderNumber,
            });
            
            // 1. Play sound
            playChaChing();

            // 2. Show native browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nouvelle Commande ! 💰', {
                body: `${data.order.customerName} vient de commander pour ${data.order.total} MAD.`,
                icon: '/images/favicon.ico', // fallback icon
              });
            }

            // 3. Show in-app Toast
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
          }
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    };

    // Poll every 15 seconds
    const interval = setInterval(checkLatestOrder, 15000);
    // Initial check
    checkLatestOrder();

    return () => clearInterval(interval);
  }, [lastOrderId]);

  return (
    <>
      {/* In-app Toast Notification */}
      <div 
        className={`fixed top-4 right-4 z-[9999] bg-white border-2 border-emerald-500 rounded-2xl shadow-2xl p-4 flex items-center gap-4 transform transition-all duration-500 ${
          showToast ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'
        }`}
      >
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
          <ShoppingCart size={24} />
        </div>
        <div>
          <h4 className="text-[15px] font-black text-[#111]">Nouvelle Commande !</h4>
          {latestOrderInfo && (
            <p className="text-[13px] text-[#666] mt-0.5">
              <span className="font-bold text-[#111]">{latestOrderInfo.name}</span> a dépensé <span className="font-black text-emerald-600">{latestOrderInfo.amount} MAD</span>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
