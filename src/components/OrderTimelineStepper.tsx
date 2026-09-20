'use client';

import React from 'react';
import { Check, Clock, Phone, Package, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
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

  // Find real recorded events in timeline
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
  const isCanceled = normStatus === 'canceled';

  const isShipped = Boolean(shipEvent) || ['shipped', 'delivered', 'refused', 'returned'].includes(normStatus);
  const isPrepared = Boolean(prepEvent) || ['processing', 'shipped', 'delivered', 'refused', 'returned'].includes(normStatus);
  const isConfirmed = Boolean(confirmedEvent) || isPrepared || normStatus === 'confirmed';

  // Helper to format clean actor first name / name
  const getActorShortName = (fullName?: string) => {
    if (!fullName || fullName.includes('Système') || fullName.includes('Client')) return null;
    const clean = fullName.replace(/\(Client\)/gi, '').trim();
    return clean;
  };

  const steps = [
    {
      id: 'created',
      label: 'Créée',
      sublabel: createdEvent?.createdAt ? formatTimelineTime(createdEvent.createdAt) : null,
      actor: null,
      isDone: true,
      isActive: normStatus === 'pending',
      icon: Clock,
      color: 'emerald',
    },
    {
      id: 'confirmed',
      label: 'Confirmée',
      sublabel: confirmedEvent?.createdAt ? formatTimelineTime(confirmedEvent.createdAt) : null,
      actor: confirmedEvent ? getActorShortName(confirmedEvent.actorName) : null,
      isDone: isConfirmed,
      isActive: normStatus === 'confirmed',
      icon: Phone,
      color: 'blue',
    },
    {
      id: 'prepared',
      label: 'Préparée',
      sublabel: prepEvent?.createdAt ? formatTimelineTime(prepEvent.createdAt) : null,
      actor: prepEvent ? getActorShortName(prepEvent.actorName) : null,
      isDone: isPrepared,
      isActive: normStatus === 'processing',
      icon: Package,
      color: 'indigo',
    },
    {
      id: 'shipped',
      label: 'Expédiée',
      sublabel: shipEvent?.createdAt ? formatTimelineTime(shipEvent.createdAt) : null,
      actor: shipEvent?.carrier ? shipEvent.carrier : (shipEvent ? getActorShortName(shipEvent.actorName) : null),
      isDone: isShipped,
      isActive: normStatus === 'shipped',
      icon: Truck,
      color: 'purple',
    },
    {
      id: 'delivered',
      label: isRefused ? 'Refusée' : isReturned ? 'Retour' : isCanceled ? 'Annulée' : 'Livrée',
      sublabel: deliveredEvent?.createdAt
        ? formatTimelineTime(deliveredEvent.createdAt)
        : (refusedEvent?.createdAt ? formatTimelineTime(refusedEvent.createdAt) : null),
      actor: deliveredEvent ? getActorShortName(deliveredEvent.actorName) : null,
      isDone: isDelivered,
      isActive: isDelivered || isRefused || isReturned || isCanceled,
      icon: isRefused || isCanceled ? XCircle : isReturned ? RotateCcw : CheckCircle2,
      color: isRefused || isCanceled ? 'red' : isReturned ? 'amber' : 'emerald',
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#555] flex-wrap">
        {steps.map((step, idx) => {
          const showArrow = idx < steps.length - 1;
          const isCurrentActive = step.isActive;
          const isDone = step.isDone;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border transition-all ${
                  isCurrentActive
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 font-semibold shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
                    : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                }`}
              >
                <span>{step.label}</span>
                {step.sublabel && (
                  <span className="text-[10px] opacity-75 font-mono">({step.sublabel})</span>
                )}
                {step.actor && (
                  <span className="text-[10px] font-bold underline decoration-dotted ml-0.5 text-gray-800">
                    {step.actor}
                  </span>
                )}
              </div>
              {showArrow && <span className="text-gray-300 font-mono text-[11px]">→</span>}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
      <div className="grid grid-cols-5 gap-2 relative">
        {/* Connecting progress line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-gray-100 -z-0" />

        {steps.map((step) => {
          const StepIcon = step.icon;
          const isDone = step.isDone;
          const isActive = step.isActive;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center group">
              {/* Icon Circle */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                    : isActive
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {isDone ? <Check size={16} strokeWidth={2.5} /> : <StepIcon size={16} />}
              </div>

              {/* Title & Actor */}
              <div className="mt-2 text-center">
                <div
                  className={`text-[12px] font-bold ${
                    isDone || isActive ? 'text-[#111]' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </div>

                {step.sublabel && (
                  <div className="text-[10px] font-mono text-gray-500 mt-0.5">
                    {step.sublabel}
                  </div>
                )}

                {step.actor && (
                  <div className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-gray-100 text-[10px] font-medium text-gray-800 border border-gray-200">
                    par <span className="font-bold">{step.actor}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
