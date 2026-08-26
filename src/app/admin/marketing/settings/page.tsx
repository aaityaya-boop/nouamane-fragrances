import React from 'react';
import { Settings2, ShieldCheck, Mail, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MarketingSettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Marketing Settings</h1>
        <p className="text-muted-foreground mt-2">Configure email and WhatsApp provider credentials securely.</p>
      </div>

      <div className="grid gap-6">
        
        {/* Email Provider */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-gray-400" size={24} />
            <div>
              <h3 className="font-bold text-gray-900">Email Provider (SMTP / API)</h3>
              <p className="text-sm text-gray-500">Configure Resend, SendGrid, or standard SMTP.</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-gray-700">Status: NOT_CONFIGURED</span>
            </div>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
              Configure Keys
            </button>
          </div>
        </div>

        {/* WhatsApp Provider */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="text-gray-400" size={24} />
            <div>
              <h3 className="font-bold text-gray-900">WhatsApp Business API</h3>
              <p className="text-sm text-gray-500">Official Meta API integration for secure messaging.</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-gray-700">Status: NOT_CONFIGURED</span>
            </div>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
              Connect Meta App
            </button>
          </div>
        </div>

        {/* Safety & Automation Rules */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-indigo-500" size={24} />
            <div>
              <h3 className="font-bold text-gray-900">Safety & Automation Rules</h3>
              <p className="text-sm text-gray-500">Strict rules to prevent spam and ensure GDPR/consent compliance.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="font-medium text-sm text-gray-900">Require Admin Approval</div>
                <div className="text-xs text-gray-500">All campaigns must be manually approved before sending.</div>
              </div>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">ENABLED</div>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="font-medium text-sm text-gray-900">Enforce Marketing Consent</div>
                <div className="text-xs text-gray-500">Only send to customers with explicitly captured consent flags.</div>
              </div>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">ENABLED</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-gray-900">Automatic Abandoned Cart Emails</div>
                <div className="text-xs text-gray-500">Send without approval after 60 mins.</div>
              </div>
              <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold">DISABLED</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
