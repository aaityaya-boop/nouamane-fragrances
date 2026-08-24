import React from 'react';
import { Map, CheckCircle, Globe, RefreshCw } from 'lucide-react';

export default function SitemapPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Sitemap Management</h2>
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
          <RefreshCw size={16} />
          Validate Sitemap
        </button>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
        <div className="p-6 bg-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <Map size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">sitemap.xml</h3>
              <a href="https://nayparfum.ma/sitemap.xml" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                https://nayparfum.ma/sitemap.xml
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle size={16} /> Valid
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Total URLs</div>
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <Globe size={16} className="text-gray-400" /> 428
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Last Checked</div>
              <div className="text-gray-900 font-medium">24 Aug 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
