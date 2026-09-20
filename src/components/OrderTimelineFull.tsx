'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Phone,
  Package,
  Truck,
  AlertCircle,
  XCircle,
  RotateCcw,
  MessageSquare,
  PhoneCall,
  User,
  Copy,
  Check,
  Send,
  Plus,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import OrderTimelineStepper, { TimelineEvent } from './OrderTimelineStepper';
import { formatTimelineDate, formatTimelineTime } from '@/lib/orders/timeline';

interface OrderTimelineFullProps {
  order: any;
  currentUser?: {
    id?: string;
    name?: string;
    role?: string;
    avatar?: string | null;
  } | null;
  onUpdateStatus: (newStatus: string, options?: { carrier?: string; trackingNumber?: string; customNote?: string; actorNameOverride?: string }) => Promise<void>;
  onAddNote: (note: string, type?: string) => Promise<void>;
}

const CARRIERS = [
  'Amana Express',
  'Cathedis',
  'Ozon Express',
  'SDTM',
  'Livreur Interne NAY',
  'Autre Transporteur',
];

export default function OrderTimelineFull({
  order,
  currentUser,
  onUpdateStatus,
  onAddNote,
}: OrderTimelineFullProps) {
  const [showShipModal, setShowShipModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState('Amana Express');
  const [trackingNum, setTrackingNum] = useState('');
  const [shippingNote, setShippingNote] = useState('');
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('NOTE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const timeline: TimelineEvent[] = order.timeline || [];
  const currentStatus = (order.status || 'pending').toLowerCase();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAdvance = async (nextStatus: string, note?: string) => {
    setIsSubmitting(true);
    try {
      await onUpdateStatus(nextStatus, {
        customNote: note,
        actorNameOverride: currentUser?.name || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateStatus('shipped', {
        carrier: selectedCarrier,
        trackingNumber: trackingNum || `AMN-${Date.now().toString().slice(-6)}`,
        customNote: shippingNote || `Expédiée via ${selectedCarrier}`,
        actorNameOverride: currentUser?.name || undefined,
      });
      setShowShipModal(false);
      setTrackingNum('');
      setShippingNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddNote(newNote, noteType);
      setNewNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventIcon = (status: string) => {
    switch (status) {
      case 'CREATED':
        return { icon: Clock, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'CONFIRMED':
        return { icon: Phone, bg: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'PREPARING':
      case 'PREPARED':
        return { icon: Package, bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
      case 'SHIPPED':
        return { icon: Truck, bg: 'bg-purple-50 text-purple-600 border-purple-200' };
      case 'DELIVERED':
        return { icon: CheckCircle2, bg: 'bg-emerald-600 text-white border-emerald-600' };
      case 'REFUSED':
        return { icon: XCircle, bg: 'bg-red-50 text-red-600 border-red-200' };
      case 'RETURNED':
        return { icon: RotateCcw, bg: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'CALL_ATTEMPT':
        return { icon: PhoneCall, bg: 'bg-amber-50 text-amber-600 border-amber-200' };
      default:
        return { icon: MessageSquare, bg: 'bg-gray-50 text-gray-600 border-gray-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stepper */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
            <Clock size={16} className="text-[#0ea5e9]" /> Parcours de la commande
          </h3>
          <span className="text-[11px] font-mono text-gray-500">
            {timeline.length} événement(s) enregistré(s)
          </span>
        </div>
        <OrderTimelineStepper status={order.status} timeline={timeline} />
      </div>

      {/* Quick Action Flow Buttons */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100/80 p-4 rounded-2xl border border-gray-200">
        <div className="text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Actions rapides d'étape</span>
          {currentUser && (
            <span className="text-[11px] font-medium text-gray-500">
              Connecté en tant que: <strong className="text-gray-800">{currentUser.name}</strong>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Action 1: Confirm */}
          {currentStatus === 'pending' && (
            <button
              onClick={() => handleQuickAdvance('confirmed', 'Commande confirmée avec le client par téléphone')}
              disabled={isSubmitting}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Phone size={14} /> Confirmer la commande
            </button>
          )}

          {/* Action 2: Prepare */}
          {(currentStatus === 'pending' || currentStatus === 'confirmed') && (
            <button
              onClick={() => handleQuickAdvance('processing', 'Flacons et packaging prêts pour expédition')}
              disabled={isSubmitting}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Package size={14} /> Marquer comme Préparée
            </button>
          )}

          {/* Action 3: Ship */}
          {(currentStatus === 'pending' || currentStatus === 'confirmed' || currentStatus === 'processing') && (
            <button
              onClick={() => setShowShipModal(true)}
              disabled={isSubmitting}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Truck size={14} /> Expédier avec Transporteur...
            </button>
          )}

          {/* Action 4: Deliver */}
          {currentStatus === 'shipped' && (
            <button
              onClick={() => handleQuickAdvance('delivered', `Colis livré à ${order.shippingCity} et montant perçu`)}
              disabled={isSubmitting}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> Marquer comme Livrée & Encaissée
            </button>
          )}

          {/* Action 5: Call attempt */}
          <button
            onClick={() => {
              setNoteType('CALL_ATTEMPT');
              setNewNote('Tentative d\'appel: Pas de réponse du client.');
            }}
            className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <PhoneCall size={13} className="text-amber-500" /> Appel non répondu
          </button>

          {/* Action 6: Refusal/Return */}
          {['shipped', 'delivered'].includes(currentStatus) && (
            <button
              onClick={() => handleQuickAdvance('refused', 'Client a refusé la livraison')}
              disabled={isSubmitting}
              className="px-3 py-2 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <XCircle size={13} /> Refus client
            </button>
          )}
        </div>
      </div>

      {/* Shipping Modal */}
      {showShipModal && (
        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl animate-in fade-in duration-200">
          <form onSubmit={handleShipSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[13px] font-bold text-purple-950 flex items-center gap-2">
                <Truck size={16} className="text-purple-600" /> Détails de l'expédition
              </h4>
              <button
                type="button"
                onClick={() => setShowShipModal(false)}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                Fermer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Transporteur</label>
                <select
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                  className="w-full text-[13px] bg-white border border-purple-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Numéro de suivi (Tracking)</label>
                <input
                  type="text"
                  placeholder="ex: AMN-849204"
                  value={trackingNum}
                  onChange={(e) => setTrackingNum(e.target.value)}
                  className="w-full text-[13px] bg-white border border-purple-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Note pour le livreur / Équipe</label>
              <input
                type="text"
                placeholder="ex: Joignable après 15h, quartier Hassan"
                value={shippingNote}
                onChange={(e) => setShippingNote(e.target.value)}
                className="w-full text-[13px] bg-white border border-purple-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowShipModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Confirmer l'expédition
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vertical Timeline Audit Trail */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-900 mb-6 flex items-center justify-between">
          <span>Historique chronologique détaillé</span>
          <span className="text-[11px] font-mono text-gray-400">Heure Maroc (GMT+1)</span>
        </h4>

        <div className="relative pl-6 space-y-6 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
          {timeline.map((event, idx) => {
            const { icon: EventIcon, bg: iconClass } = getEventIcon(event.status);
            const timeStr = formatTimelineTime(event.createdAt);
            const dateStr = formatTimelineDate(event.createdAt);

            return (
              <div key={event.id || idx} className="relative group">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-[30px] top-0 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white shadow-xs transition-transform group-hover:scale-110 ${iconClass}`}
                >
                  <EventIcon size={14} />
                </div>

                {/* Content Box */}
                <div className="bg-gray-50/70 hover:bg-gray-50 p-4 rounded-xl border border-gray-200/80 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-gray-900">
                        {event.title}
                      </span>

                      {/* Actor Badge */}
                      {event.actorName && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-gray-700 shadow-2xs">
                          <User size={10} className="text-gray-400" />
                          <strong className="font-semibold text-gray-900">{event.actorName}</strong>
                          {event.actorRole && (
                            <span className="text-gray-400 text-[10px]">({event.actorRole})</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-[11px] font-mono font-semibold text-gray-500 shrink-0">
                      {dateStr} <span className="text-gray-400">({timeStr})</span>
                    </div>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-[12px] text-gray-600 leading-relaxed mt-1">
                      {event.description}
                    </p>
                  )}

                  {/* Tracking Number / Carrier info */}
                  {(event.carrier || event.trackingNumber) && (
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap pt-2 border-t border-gray-200/60">
                      {event.carrier && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-200">
                          <Truck size={12} /> {event.carrier}
                        </span>
                      )}
                      {event.trackingNumber && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono text-[11px] border border-gray-200">
                          <span>N° {event.trackingNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(event.trackingNumber!, event.id)}
                            className="text-gray-500 hover:text-gray-800"
                            title="Copier le numéro"
                          >
                            {copiedId === event.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Custom Note / Action */}
        <form onSubmit={handleAddNoteSubmit} className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] font-bold text-gray-700 flex items-center gap-1.5">
              <Plus size={14} /> Ajouter une note ou un suivi interne
            </label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setNoteType('NOTE')}
                className={`px-2 py-0.5 rounded-md ${
                  noteType === 'NOTE' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Note
              </button>
              <button
                type="button"
                onClick={() => setNoteType('CALL_ATTEMPT')}
                className={`px-2 py-0.5 rounded-md ${
                  noteType === 'CALL_ATTEMPT' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Appel client
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={noteType === 'CALL_ATTEMPT' ? "ex: Appel à 14h20: Client confirme adresse de livraison" : "Ajouter une note interne sur la commande..."}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 text-[13px] bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newNote.trim()}
              className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Send size={14} /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
