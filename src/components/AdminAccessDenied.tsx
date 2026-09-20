'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, MessageSquare, Home } from 'lucide-react';

interface AdminAccessDeniedProps {
  title?: string;
  message?: string;
  requiredPermission?: string;
  userRole?: string;
}

export default function AdminAccessDenied({
  title = 'Accès Réservé & Privilèges Insuffisants',
  message = 'Votre rôle actuel ou vos permissions personnalisées ne vous permettent pas d\'accéder à ce module.',
  requiredPermission,
  userRole,
}: AdminAccessDeniedProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111111] border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-500/10">
          <ShieldAlert size={32} />
        </div>

        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
          {title}
        </h2>
        
        <p className="text-sm text-[#888888] leading-relaxed mb-6">
          {message}
        </p>

        {(requiredPermission || userRole) && (
          <div className="bg-[#181818] border border-white/5 rounded-xl p-3.5 mb-6 text-left space-y-1.5 text-xs">
            {userRole && (
              <div className="flex justify-between items-center text-[#888888]">
                <span>Votre rôle :</span>
                <span className="font-mono text-white font-semibold uppercase">{userRole}</span>
              </div>
            )}
            {requiredPermission && (
              <div className="flex justify-between items-center text-[#888888]">
                <span>Permission requise :</span>
                <span className="font-mono text-amber-400 font-semibold">{requiredPermission}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/admin"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#eaeaea] transition-all shadow-md"
          >
            <Home size={14} />
            <span>Tableau de Bord</span>
          </Link>
          <Link
            href="/admin/chat"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#222222] text-white font-medium text-xs hover:bg-[#2c2c2c] border border-white/10 transition-all"
          >
            <MessageSquare size={14} />
            <span>Chat Équipe</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
