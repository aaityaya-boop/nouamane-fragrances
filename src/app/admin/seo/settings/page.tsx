import prisma from "@/lib/prisma";
import { Settings, Brain, Key, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SeoSettingsPage() {
  let settings = await prisma.seoSettings.findFirst();
  if (!settings) {
    settings = await prisma.seoSettings.create({ data: {} });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">SEO Settings</h1>
        <p className="text-muted-foreground mt-2">Manage AI Providers and automation preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI SEO Engine</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">AI Provider</label>
              <div className="mt-1 text-sm bg-gray-50 p-3 rounded-md border text-gray-600">
                {settings.aiProvider} (Configured via Environment Variables)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">AI Model</label>
              <div className="mt-1 text-sm bg-gray-50 p-3 rounded-md border text-gray-600">
                {settings.aiModel}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-orange-900">Auto-Apply is Disabled</h3>
                <p className="text-sm text-orange-700 mt-1">
                  For data integrity and safety, the AI is not permitted to automatically alter production records. 
                  All AI recommendations must be manually reviewed and approved by an administrator.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Tracking & Integrations</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-700">Google Tag Manager (GTM)</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${process.env.NEXT_PUBLIC_GTM_ID ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {process.env.NEXT_PUBLIC_GTM_ID ? 'CONNECTED' : 'NOT_CONFIGURED'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-700">Google Analytics (GA4)</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${process.env.NEXT_PUBLIC_GA4_ID ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {process.env.NEXT_PUBLIC_GA4_ID ? 'CONNECTED' : 'NOT_CONFIGURED'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-700">Google Search Console</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${settings.googleSearchConsoleConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {settings.googleSearchConsoleConnected ? 'CONNECTED' : 'NOT_CONFIGURED'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-700">PageSpeed Insights API</span>
              <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-700">
                NO_DATA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

