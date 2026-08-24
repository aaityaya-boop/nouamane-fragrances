import React from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

export default function AiAssistantPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">AI SEO Optimizer</h2>
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
          <Sparkles size={16} />
          Generate SEO
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Current SEO</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900">
                Valentino Uomo - Nay Parfum
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900 h-24">
                Achetez Valentino Uomo chez Nay Parfum.
              </div>
            </div>
          </div>
        </div>

        <div className="border border-blue-200 bg-blue-50/10 rounded-xl p-6 relative">
          <h3 className="text-sm font-bold text-blue-600 uppercase mb-4">AI Suggestion</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Optimized Title</label>
              <div className="p-3 bg-white rounded-lg border border-blue-200 text-sm text-gray-900">
                Valentino Uomo Parfum Pour Homme - Nay Parfum Maroc
              </div>
              <button className="mt-2 text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                <Check size={12} /> Apply Title
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Optimized Description</label>
              <div className="p-3 bg-white rounded-lg border border-blue-200 text-sm text-gray-900 h-24">
                D\u00e9couvrez le parfum Valentino Uomo pour homme chez Nay Parfum. Une fragrance &eacute;l&eacute;gante aux notes bois&eacute;es. Livraison partout au Maroc.
              </div>
              <button className="mt-2 text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                <Check size={12} /> Apply Description
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
