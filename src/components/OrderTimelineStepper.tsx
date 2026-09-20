'use client';

import React from 'react';
import { formatTimelineTime } from '@/lib/orders/timeline';

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
    if (isRefused) return { text: 'Colis refusé', sub: refusedEvent?.createdAt ? formatTimelineTime(refusedEvent.createdAt) : '' };
    if (isReturned) return { text: 'Colis retourné', sub: returnedEvent?.createdAt ? formatTimelineTime(returnedEvent.createdAt) : '' };
    if (isDelivered) return { text: 'Livrée & Encaissée', sub: deliveredEvent?.createdAt ? formatTimelineTime(deliveredEvent.createdAt) : '' };
    if (isShipped) {
      const carrierText = shipEvent?.carrier || 'Expédiée';
      const time = shipEvent?.createdAt ? formatTimelineTime(shipEvent.createdAt) : '';
      return { text: carrierText, sub: time };
    }
    if (isPrepared) {
      const actor = prepEvent?.actorName ? prepEvent.actorName.replace(/\(Client\)/g, '').trim() : '';
      const time = prepEvent?.createdAt ? formatTimelineTime(prepEvent.createdAt) : '';
      return { text: actor ? `Préparée (${actor})` : 'En préparation', sub: time };
    }
    if (isConfirmed) {
      const actor = confirmedEvent?.actorName ? confirmedEvent.actorName.replace(/\(Client\)/g, '').trim() : '';
      const time = confirmedEvent?.createdAt ? formatTimelineTime(confirmedEvent.createdAt) : '';
      return { text: actor ? `Confirmée (${actor})` : 'Confirmée', sub: time };
    }
    return {
      text: 'Créée en ligne',
      sub: createdEvent?.createdAt ? formatTimelineTime(createdEvent.createdAt) : '',
    };
  };

  const latest = getLatestSummary();

  // In compact table mode: clean, elegant, hand-crafted minimal bar + crisp summary line
  if (compact) {
    return (
      <div className="space-y-1.5 py-1">
        {/* Minimal 4-segment progress bar */}
        <div className="flex items-center gap-1 w-36">
          {[0, 1, 2, 3].map((stepIdx) => {
            const isFilled = currentStageIndex >= stepIdx + 1 || (stepIdx === 0 && currentStageIndex >= 0);
            const isCurrent = currentStageIndex === stepIdx;

            return (
              <div
                key={stepIdx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  isRefused
                    ? isFilled ? 'bg-rose-500' : 'bg-neutral-200'
                    : isFilled
                    ? 'bg-neutral-900'
                    : 'bg-neutral-200'
                }`}
              />
            );
          })}
        </div>

        {/* Crisp text status & real time */}
        <div className="flex items-center gap-1.5 text-[12px] text-neutral-700 font-medium">
          <span className="text-neutral-900 font-semibold">{latest.text}</span>
          {latest.sub && (
            <span className="text-neutral-400 font-mono text-[11px]">
              • {latest.sub}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full view (inside drawer / modal): simple, classic 5-step horizontal tracker
  const steps = [
    { label: 'Créée', time: createdEvent?.createdAt ? formatTimelineTime(createdEvent.createdAt) : null, actor: null, isDone: true },
    { label: 'Confirmée', time: confirmedEvent?.createdAt ? formatTimelineTime(confirmedEvent.createdAt) : null, actor: confirmedEvent?.actorName, isDone: isConfirmed },
    { label: 'Préparée', time: prepEvent?.createdAt ? formatTimelineTime(prepEvent.createdAt) : null, actor: prepEvent?.actorName, isDone: isPrepared },
    { label: 'Expédiée', time: shipEvent?.createdAt ? formatTimelineTime(shipEvent.createdAt) : null, actor: shipEvent?.carrier || shipEvent?.actorName, isDone: isShipped },
    { label: isRefused ? 'Refusée' : isReturned ? 'Retour' : 'Livrée', time: deliveredEvent?.createdAt ? formatTimelineTime(deliveredEvent.createdAt) : null, actor: null, isDone: isDelivered || isRefused || isReturned },
  ];

  return (
    <div className="bg-neutral-50/80 border border-neutral-200 rounded-xl p-4">
      <div className="grid grid-cols-5 gap-2 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            {/* Step dot */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all ${
                step.isDone
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-300 text-neutral-400'
              }`}
            >
              {idx + 1}
            </div>

            {/* Label */}
            <div className={`text-[12px] font-medium mt-1.5 ${step.isDone ? 'text-neutral-900 font-semibold' : 'text-neutral-400'}`}>
              {step.label}
            </div>

            {/* Timestamp */}
            {step.time && (
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                {step.time}
              </div>
            )}

            {/* Actor */}
            {step.actor && (
              <div className="text-[10px] text-neutral-600 truncate max-w-[85px] mt-0.5">
                {step.actor.replace(/\(Client\)/g, '').trim()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
