'use client';

import React, { useState, useRef } from 'react';
import {
  Check,
  Clock,
  Phone,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Paperclip,
  FileText,
  Upload,
  Copy,
  Plus,
  Send,
  Eye,
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
    jobTitle?: string;
    avatar?: string | null;
  } | null;
  onUpdateStatus: (newStatus: string, options?: { carrier?: string; trackingNumber?: string; customNote?: string; actorNameOverride?: string }) => Promise<void>;
  onAddNote: (note: string, type?: string) => Promise<void>;
  onAddAttachment?: (data: { attachmentUrl: string; attachmentName: string; attachmentType: string; description?: string }) => Promise<void>;
}

const CARRIERS = [
  'Amana Express',
  'Cathedis',
  'Ozon Express',
  'SDTM',
  'Livreur Interne',
  'Autre',
];

export default function OrderTimelineFull({
  order,
  currentUser,
  onUpdateStatus,
  onAddNote,
  onAddAttachment,
}: OrderTimelineFullProps) {
  const [showShipModal, setShowShipModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState('Amana Express');
  const [trackingNum, setTrackingNum] = useState('');
  const [shippingNote, setShippingNote] = useState('');
  
  // Note form state
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('NOTE');

  // Attachment form state
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [attachDescription, setAttachDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const timeline: TimelineEvent[] = order.timeline || [];
  const currentStatus = (order.status || 'pending').toLowerCase();
  const currentActorName = currentUser?.name || 'Nouamane Ait Yahya';
  const currentActorRole = currentUser?.jobTitle || (currentUser?.role === 'OWNER' ? 'Propriétaire' : currentUser?.role || 'Admin');

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
        actorNameOverride: currentActorName,
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
        actorNameOverride: currentActorName,
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

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', attachFile);

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const { url } = await uploadRes.json();

      const isImg = attachFile.type.startsWith('image/');
      const fileType = isImg ? 'IMAGE' : attachFile.type.includes('pdf') ? 'PDF' : 'DOCUMENT';

      if (onAddAttachment) {
        await onAddAttachment({
          attachmentUrl: url,
          attachmentName: attachFile.name,
          attachmentType: fileType,
          description: attachDescription || `Pièce jointe ajoutée par ${currentActorName}`,
        });
      } else {
        await fetch(`/api/admin/orders/${order.id}/attachment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attachmentUrl: url,
            attachmentName: attachFile.name,
            attachmentType: fileType,
            description: attachDescription,
            actorNameOverride: currentActorName,
          }),
        });
      }

      setAttachFile(null);
      setAttachDescription('');
      setShowAttachModal(false);
    } catch (err) {
      console.error('Failed to attach file:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Simple Step Tracker */}
      <div>
        <div className="text-[13px] font-semibold text-neutral-900 mb-3 flex items-center justify-between">
          <span>Étapes de la commande</span>
          <span className="text-[12px] text-neutral-400 font-normal">
            {timeline.length} entrée(s)
          </span>
        </div>
        <OrderTimelineStepper status={order.status} timeline={timeline} compact={false} />
      </div>

      {/* 2. Simple Action Bar */}
      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between mb-3 text-[12px] text-neutral-500">
          <span>Actions</span>
          <span>Par : <strong className="text-neutral-900 font-medium">{currentActorName}</strong></span>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentStatus === 'pending' && (
            <button
              onClick={() => handleQuickAdvance('confirmed', 'Confirmée par téléphone')}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50"
            >
              Confirmer
            </button>
          )}

          {(currentStatus === 'pending' || currentStatus === 'confirmed') && (
            <button
              onClick={() => handleQuickAdvance('processing', 'Colis prêt et emballé')}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50"
            >
              Marquer préparée
            </button>
          )}

          {(currentStatus === 'pending' || currentStatus === 'confirmed' || currentStatus === 'processing') && (
            <button
              onClick={() => setShowShipModal(true)}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50"
            >
              Expédier...
            </button>
          )}

          {currentStatus === 'shipped' && (
            <button
              onClick={() => handleQuickAdvance('delivered', `Colis livré et montant de ${order.total} MAD encaissé`)}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50"
            >
              Marquer livrée
            </button>
          )}

          <button
            onClick={() => setShowAttachModal(true)}
            className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors"
          >
            <Paperclip size={13} /> Joindre un document
          </button>

          <button
            onClick={() => {
              setNoteType('CALL_ATTEMPT');
              setNewNote('Appel sans réponse');
            }}
            className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-lg text-[12px] font-medium transition-colors"
          >
            Appel sans réponse
          </button>

          {['shipped', 'delivered'].includes(currentStatus) && (
            <button
              onClick={() => handleQuickAdvance('refused', 'Colis refusé')}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50"
            >
              Refus client
            </button>
          )}
        </div>
      </div>

      {/* Attachment Upload Form */}
      {showAttachModal && (
        <form onSubmit={handleFileUpload} className="p-4 bg-white border border-neutral-300 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-neutral-900">Ajouter une pièce jointe</span>
            <button type="button" onClick={() => setShowAttachModal(false)} className="text-xs text-neutral-400 hover:text-neutral-700">Fermer</button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => setAttachFile(e.target.files?.[0] || null)}
            className="w-full text-[12px] text-neutral-700 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-neutral-100 hover:file:bg-neutral-200 cursor-pointer"
          />
          <input
            type="text"
            placeholder="Description (ex: Bordereau de livraison signé)"
            value={attachDescription}
            onChange={(e) => setAttachDescription(e.target.value)}
            className="w-full text-[12px] border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAttachModal(false)} className="px-3 py-1 text-xs text-neutral-600">Annuler</button>
            <button type="submit" disabled={isUploading || !attachFile} className="px-3.5 py-1 bg-neutral-900 text-white rounded-lg text-xs font-medium disabled:opacity-50">
              {isUploading ? 'Envoi...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Shipping Form */}
      {showShipModal && (
        <form onSubmit={handleShipSubmit} className="p-4 bg-white border border-neutral-300 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-neutral-900">Expédition du colis</span>
            <button type="button" onClick={() => setShowShipModal(false)} className="text-xs text-neutral-400 hover:text-neutral-700">Fermer</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Transporteur</label>
              <select
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
                className="w-full text-[12px] border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">N° de suivi</label>
              <input
                type="text"
                placeholder="AMN-..."
                value={trackingNum}
                onChange={(e) => setTrackingNum(e.target.value)}
                className="w-full text-[12px] border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowShipModal(false)} className="px-3 py-1 text-xs text-neutral-600">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="px-3.5 py-1 bg-neutral-900 text-white rounded-lg text-xs font-medium">
              Confirmer l'expédition
            </button>
          </div>
        </form>
      )}

      {/* 3. Clean Vertical Timeline */}
      <div className="space-y-4">
        <div className="text-[13px] font-semibold text-neutral-900">
          Historique
        </div>

        <div className="border-l border-neutral-200 pl-4 ml-1 space-y-4">
          {timeline.map((event, idx) => {
            const timeStr = formatTimelineTime(event.createdAt);
            const dateStr = formatTimelineDate(event.createdAt);

            return (
              <div key={event.id || idx} className="relative group">
                {/* Clean dark dot */}
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-neutral-900 ring-4 ring-white" />

                <div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-neutral-900">
                      {event.title}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      {dateStr}
                    </span>
                  </div>

                  {event.description && (
                    <div className="text-[12px] text-neutral-600 mt-0.5">
                      {event.description}
                    </div>
                  )}

                  {/* Attachment if present */}
                  {event.attachmentUrl && (
                    <div className="mt-2 inline-flex items-center gap-2 p-2 bg-neutral-50 rounded-lg border border-neutral-200 text-[12px]">
                      <FileText size={14} className="text-neutral-600" />
                      <span className="font-medium text-neutral-800">{event.attachmentName || 'Fichier'}</span>
                      <a
                        href={event.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-900 font-semibold hover:underline text-[11px] ml-1"
                      >
                        Ouvrir
                      </a>
                    </div>
                  )}

                  {/* Tracking if present */}
                  {event.trackingNumber && (
                    <div className="mt-1.5 text-[11px] font-mono text-neutral-600">
                      Suivi : <span className="font-semibold text-neutral-900">{event.trackingNumber}</span>
                    </div>
                  )}

                  {/* Actor tag */}
                  {event.actorName && (
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Par {event.actorName} {event.actorRole ? `(${event.actorRole})` : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Note input */}
        <form onSubmit={handleAddNoteSubmit} className="pt-2 flex gap-2">
          <input
            type="text"
            placeholder="Ajouter une note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 text-[12px] border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-900"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newNote.trim()}
            className="px-3.5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium disabled:opacity-50"
          >
            Ajouter
          </button>
        </form>
      </div>
    </div>
  );
}
