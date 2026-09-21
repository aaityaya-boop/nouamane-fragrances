'use client';

import React from 'react';
import { formatTimelineTime } from '@/lib/orders/timeline';
import { Check, Truck, Package, Clock, XCircle, RotateCcw } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  orderId: string;
  status: string;
  title: string;
  description?: string | null;
  actorName: string;
  actorRole?: string | null;
  actorAvatar?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  createdAt: string | Date;
}

interface OrderTimelineStepperProps {
  status: string;
  timeline?: TimelineEvent[];
  compact?: boolean;
}

export default function OrderTimelineStepper({ status, timeline = [], compact = false }: OrderTimelineStepperProps) {
  const normStatus = (status || 'pending').toLowerCase();

  const createdEvent = timeline.find((e) => e.status === 'CREATED');
  const confirmedEvent = timeline.find((e) => e.status === 'CONFIRMED');
  const prepEvent = timeline.find((e) => e.status === 'PREPARED' || e.status === 'PREPARING');
  const shipEvent = timeline.find((e) => e.status === 'SHIPPED');
  const deliveredEvent = timeline.find((e) => e.status === 'DELIVERED');
  const refusedEvent = timeline.find((e) => e.status === 'REFUSED');
  const returnedEvent = timeline.find((e) => e.status === 'RETURNED');

  const isDelivered = Boolean(deliveredEvent) || normStatus === 'delivered';
  const isRefused = Boolean(refusedEvent) || normStatus === 'refused';
  const isReturned = Boolean(returnedEvent) || normStatus === 'returned';
  const isShipped = Boolean(shipEvent) || ['shipped', 'delivered', 'refused', 'returned'].includes(normStatus);
  const isPrepared = Boolean(prepEvent) || ['processing', 'shipped', 'delivered', 'refused', 'returned'].includes(normStatus);
  const isConfirmed = Boolean(confirmedEvent) || isPrepared || normStatus === 'confirmed';

  // Calculate current progress stage index (0 to 4)
  let currentStageIndex = 0;
  if (isDelivered || isRefused || isReturned) currentStageIndex = 4;
  else if (isShipped) currentStageIndex = 3;
  else if (isPrepared) currentStageIndex = 2;
  else if (isConfirmed) currentStageIndex = 1;

  // Build the most relevant recent event label for compact view
  const getLatestSummary = () => {
    if (isRefused) return { text: 'Colis refusé', sub: refusedEvent?.createdAt ? formatTimelineTime(refusedEvent.createdAt) : '', color: 'text-rose-600' };
    if (isReturned) return { text: 'Colis retourné', sub: returnedEvent?.createdAt ? formatTimelineTime(returnedEvent.createdAt) : '', color: 'text-rose-600' };
    if (isDelivered) return { text: 'Livrée & Encaissée', sub: deliveredEvent?.createdAt ? formatTimelineTime(deliveredEvent.createdAt) : '', color: 'text-emerald-600' };
    if (isShipped) {
      const carrierText = shipEvent?.carrier ? `Expédiée via ${shipEvent.carrier}` : 'En cours de livraison';
      const time = shipEvent?.createdAt ? formatTimelineTime(shipEvent.createdAt) : '';
      return { text: carrierText, sub: time, color: 'text-indigo-600' };
    }
    if (isPrepared) {
      const actor = prepEvent?.actorName ? prepEvent.actorName.replace(/\(Client\)/g, '').trim() : '';
      const time = prepEvent?.createdAt ? formatTimelineTime(prepEvent.createdAt) : '';
      return { text: actor ? `Colis préparé (${actor})` : 'En préparation', sub: time, color: 'text-sky-600' };
    }
    if (isConfirmed) {
      const actor = confirmedEvent?.actorName ? confirmedEvent.actorName.replace(/\(Client\)/g, '').trim() : '';
      const time = confirmedEvent?.createdAt ? formatTimelineTime(confirmedEvent.createdAt) : '';
      return { text: actor ? `Confirmée (${actor})` : 'Commande confirmée', sub: time, color: 'text-amber-600' };
    }
    return {
      text: 'Créée en ligne',
      sub: createdEvent?.createdAt ? formatTimelineTime(createdEvent.createdAt) : '',
      color: 'text-slate-700',
    };
  };

  const latest = getLatestSummary();

  // In compact table mode: clean, creative progress bar with subtle brand glow
  if (compact) {
    const getFillColor = (idx: number) => {
      if (isRefused || isReturned) return 'bg-rose-500 shadow-rose-500/20';
      if (isDelivered) return 'bg-emerald-500 shadow-emerald-500/20';
      if (isShipped) return 'bg-indigo-500 shadow-indigo-500/20';
      if (isPrepared) return 'bg-[#1D9BF0] shadow-sky-500/20';
      return 'bg-amber-500 shadow-amber-500/20';
    };

    return (
      <div className="space-y-1.5 py-0.5">
        {/* Creative Segmented Progress Indicator */}
        <div className="flex items-center gap-1 w-32">
          {[0, 1, 2, 3].map((stepIdx) => {
            const isFilled = currentStageIndex >= stepIdx + 1 || (stepIdx === 0 && currentStageIndex >= 0);

            return (
              <div
                key={stepIdx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  isFilled
                    ? `${getFillColor(stepIdx)} shadow-2xs`
                    : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>

        {/* Text Status & Time */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className={`font-semibold ${latest.color}`}>{latest.text}</span>
          {latest.sub && (
            <span className="text-slate-400 font-mono text-[10px]">
              • {latest.sub}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full view (inside drawer / modal): sleek 5-step horizontal tracker with icons
  const steps = [
    { label: 'Créée', icon: <Clock size={12} />, time: createdEvent?.createdAt ? formatTimelineTime(createdEvent.createdAt) : null, actor: null, isDone: true, color: 'sky' },
    { label: 'Confirmée', icon: <Check size={12} />, time: confirmedEvent?.createdAt ? formatTimelineTime(confirmedEvent.createdAt) : null, actor: confirmedEvent?.actorName, isDone: isConfirmed, color: 'amber' },
    { label: 'Préparée', icon: <Package size={12} />, time: prepEvent?.createdAt ? formatTimelineTime(prepEvent.createdAt) : null, actor: prepEvent?.actorName, isDone: isPrepared, color: 'sky' },
    { label: 'Expédiée', icon: <Truck size={12} />, time: shipEvent?.createdAt ? formatTimelineTime(shipEvent.createdAt) : null, actor: shipEvent?.carrier || shipEvent?.actorName, isDone: isShipped, color: 'indigo' },
    { label: isRefused ? 'Refusée' : isReturned ? 'Retour' : 'Livrée', icon: isRefused ? <XCircle size={12} /> : isReturned ? <RotateCcw size={12} /> : <Check size={12} />, time: deliveredEvent?.createdAt ? formatTimelineTime(deliveredEvent.createdAt) : null, actor: null, isDone: isDelivered || isRefused || isReturned, color: isRefused || isReturned ? 'rose' : 'emerald' },
  ];

  return (
    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
      <div className="grid grid-cols-5 gap-2 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            {/* Step dot with icon */}
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                step.isDone
                  ? 'bg-[#1D9BF0] text-white'
                  : 'bg-white border border-slate-200 text-slate-400'
              }`}
            >
              {step.icon}
            </div>

            {/* Label */}
            <div className={`text-[11px] font-semibold mt-1.5 ${step.isDone ? 'text-slate-900' : 'text-slate-400'}`}>
              {step.label}
            </div>

            {/* Timestamp */}
            {step.time && (
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                {step.time}
              </div>
            )}

            {/* Actor */}
            {step.actor && (
              <div className="text-[10px] text-slate-500 truncate max-w-[80px] mt-0.5 font-medium">
                {step.actor.replace(/\(Client\)/g, '').trim()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
