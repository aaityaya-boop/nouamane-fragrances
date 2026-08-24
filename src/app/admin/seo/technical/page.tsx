'use client';
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Info, ArrowRight, Loader2 } from 'lucide-react';

const MOCK_ISSUES = [
  { id: 1, type: 'CRITICAL', title: 'Missing H1 Tag', description: '3 product pages are missing an H1 tag.', pages: 3 },
  { id: 2, type: 'WARNING', title: 'Duplicate Meta Descriptions', description: '12 pages have the same meta description.', pages: 12 },
  { id: 3, type: 'INFO', title: 'Images missing ALT text', description: '45 product images are missing alt attributes.', pages: 45 },
];

export default function TechnicalSeoPage() {
  const [loading, setLoading] = useState(false);
  const [lastAudit, setLastAudit] = useState('Aujourd\'hui');

  const handleAudit = async () => {
    setLoading(true);
    // Simulate audit delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    setLoading(false);
    setLastAudit('\u00A0\Il y a quelques secondes');
    alert("Audit technique terminé avec succès !\nA�cun nouvel incident critique ne s'est ajouté.");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Technical Audit</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Dernier audit : {lastAudit}</span>
          <button 
            onClick={handleAudit}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analyse en cours...</> : 'Run New Audit'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 p-5 rounded-xl border border-red-100">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle size={18} /> Critical Issues
          </div>
          <div className="text-2xl font-bold text-red-700">1</div>
        </div>
        <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <AlertCircle size={18} /> Warnings
          </div>
          <div className="text-2xl font-bold text-orange-700">12</div>
        </div>
        <div className="bg-green-50 p-5 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle size={18} /> Passed Checks
          </div>
          <div className="text-2xl font-bold text-green-700">45</div>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_ISSUES.map(issue => (
          <div key={issue.id} className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300">
            <div className="flex gap-4">
              <div className={`mt-1 ${
                issue.type === 'CRITICAL' ? 'text-red-500' 
                : issue.type === 'WARNING' ? 'text-orange-500'
                : 'text-blue-500'
              }`}>
                {issue.type === 'INFO' ? <Info size={20} /> : <AlertCircle size={20} />}
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">{issue.title}</h3>
                <p className="text-sm text-gray-550 mt-1">{issue.description}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black bg-gray-50 px-4 py-2 rounded-lg">
              View {issue.pages} pages
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
