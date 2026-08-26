import React from 'react';
import { Activity, Database, Link, Search, Mail, MessageCircle, Bot, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SystemHealthPage() {
  // Check Database
  let dbStatus = 'NOT_CONFIGURED';
  try {
    await prisma.$queryRaw\SELECT 1\;
    dbStatus = 'CONNECTED';
  } catch (error) {
    dbStatus = 'ERROR';
  }

  // Check Environment Variables
  const envStatus = {
    GTM: process.env.NEXT_PUBLIC_GTM_ID ? 'CONFIGURED' : 'NOT_CONFIGURED',
    GA4: process.env.NEXT_PUBLIC_GA4_ID ? 'CONFIGURED' : 'NOT_CONFIGURED',
    PIXEL: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ? 'CONFIGURED' : 'NOT_CONFIGURED',
    GSC: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? 'CONFIGURED' : 'NOT_CONFIGURED',
    EMAIL: process.env.RESEND_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
    WHATSAPP: process.env.WHATSAPP_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
    AI: process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'CONFIGURED':
      case 'PASS':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-200" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'CONFIGURED':
      case 'PASS':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'ERROR':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'WARNING':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="w-8 h-8 text-[#1A1A1A]" />
        <h1 className="text-3xl font-bold text-[#1A1A1A]">System Health</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Database */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-500" />
              <h2 className="font-bold text-gray-800">Database</h2>
            </div>
            {getStatusIcon(dbStatus)}
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dbStatus)}`}>
            {dbStatus}
          </div>
        </div>

        {/* GTM */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link className="w-6 h-6 text-blue-400" />
              <h2 className="font-bold text-gray-800">Google Tag Manager</h2>
            </div>
            {getStatusIcon(envStatus.GTM)}
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dbStatus)}`}>
            {envStatus.GTM}
          </div>
        </div>

        {/* GA4 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-orange-500" />
              <h2 className="font-bold text-gray-800">Google Analytics (GA4)</h2>
            </div>
            {getStatusIcon(envStatus.GA4)}
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dbStatus)}`}>
            {envStatus.GA4}
          </div>
        </div>

        {/* Facebook Pixel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-600" />
              <h2 className="font-bold text-gray-800">Facebook Pixel</h2>
            </div>
            {getStatusIcon(envStatus.PIXEL)}
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dbStatus)}`}>
            {envStatus.PIXEL}
          </div>
        </div>

        {/* Google Search Console */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search className="w-6 h-6 text-green-600" />
              <h2 className="font-bold text-gray-800">Google Search Console</h2>
            </div>
            {getStatusIcon(envStatus.GSC)}
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dbStatus)}`}>
            {envStatus.GSC}
          </div>
        </div>

        {/* Email */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-red-400" />
              <h2 className="font-bold text-gray-800">Email Provider</h2>
            </div>
            {getStatusIcon(envStatus.EMAIL)}
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dbStatus)}`}>
            {envStatus.EMAIL}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-green-500" />
              <h2 className="font-bold text-gray-800">WhatsApp Provider</h2>
            </div>
            {getStatusIcon(envStatus.WHATSAPP)}
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dbStatus)}`}>
            {envStatus.WHATSAPP}
          </div>
        </div>

        {/* AI */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-purple-500" />
              <h2 className="font-bold text-gray-800">AI Provider</h2>
            </div>
            {getStatusIcon(envStatus.AI)}
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dbStatus)}`}>
            {envStatus.AI}
          </div>
        </div>

      </div>
    </div>
  );
}
