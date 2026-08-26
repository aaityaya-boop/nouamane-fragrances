import React from 'react';
import { ArrowLeft, Save, Send } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NewCampaignPage({
  searchParams
}: {
  searchParams: { audience?: string }
}) {
  
  const audience = searchParams.audience || 'ALL';

  async function createDraft(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const channel = formData.get('channel') as string;
    const type = formData.get('type') as string;
    const aud = formData.get('audience') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    await prisma.marketingCampaign.create({
      data: {
        name,
        channel,
        type,
        audience: aud,
        subject,
        message,
        status: 'DRAFT'
      }
    });

    redirect('/admin/marketing/campaigns');
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin/marketing/campaigns" className="text-gray-500 hover:text-gray-900 bg-gray-100 p-2 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Campaign Builder</h1>
          <p className="text-muted-foreground text-sm">Create a targeted marketing campaign.</p>
        </div>
      </div>

      <form action={createDraft} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
              <input name="name" type="text" required placeholder="e.g. VIP Summer Sale" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select name="channel" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white">
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
              <select name="type" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white">
                <option value="PROMOTION">General Promotion</option>
                <option value="VIP">VIP Exclusive</option>
                <option value="REACTIVATION">Reactivation (Win-back)</option>
                <option value="ABANDONED_CART">Abandoned Cart</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience Segment</label>
              <select name="audience" defaultValue={audience} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white">
                <option value="ALL">All Customers</option>
                <option value="VIP">VIP</option>
                <option value="AT_RISK">At Risk</option>
                <option value="INACTIVE">Inactive</option>
                <option value="NEW">New</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject (Email Only)</label>
            <input name="subject" type="text" placeholder="Exclusive Offer for you..." className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
            <p className="text-xs text-gray-500 mb-2">Variables available: {'{{first_name}}'}, {'{{last_order_date}}'}</p>
            <textarea name="message" required rows={6} placeholder="Hello {{first_name}}," className="w-full border border-gray-300 rounded-lg p-3 text-sm"></textarea>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <Save size={18} /> Save as Draft
          </button>
          <div className="px-6 py-2.5 bg-gray-100 text-gray-500 font-medium rounded-lg cursor-not-allowed border border-gray-200">
            Send (Requires Approval)
          </div>
        </div>
      </form>
    </div>
  );
}
