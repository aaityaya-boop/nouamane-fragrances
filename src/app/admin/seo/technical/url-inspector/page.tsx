"use client";

import React, { useState } from 'react';
import { Search, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function UrlInspectorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/seo/technical/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to crawl URL');
      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">URL Inspector</h1>
        <p className="text-muted-foreground mt-2">Crawl and analyze any specific URL on the domain.</p>
      </div>

      <form onSubmit={handleInspect} className="flex gap-4">
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://nayparfum.ma/product/parfum-x" 
          className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          Inspect URL
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Inspection Results</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded ${result.statusCode === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              HTTP {result.statusCode}
            </span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Indexability</div>
                <div className="flex items-center gap-2 font-medium">
                  {result.isIndexable ? (
                    <><ShieldCheck size={18} className="text-emerald-500"/> Indexable</>
                  ) : (
                    <><AlertTriangle size={18} className="text-red-500"/> Not Indexable</>
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Title Tag</div>
                <div className="font-medium text-gray-900">{result.title || <span className="text-red-500 italic">Missing</span>}</div>
                {result.title && (
                  <div className="text-xs text-gray-500 mt-1">{result.title.length} characters</div>
                )}
              </div>

              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Meta Description</div>
                <div className="font-medium text-gray-900 text-sm">{result.metaDescription || <span className="text-red-500 italic">Missing</span>}</div>
                {result.metaDescription && (
                  <div className="text-xs text-gray-500 mt-1">{result.metaDescription.length} characters</div>
                )}
              </div>
              
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">H1 Tags</div>
                <div className="font-medium text-gray-900">{result.h1Count}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Canonical URL</div>
                <div className="font-medium font-mono text-xs text-gray-900 break-all bg-gray-50 p-2 rounded border">
                  {result.canonicalUrl || <span className="text-red-500 italic">Missing</span>}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Robots Directive</div>
                <div className="font-medium text-gray-900">{result.robots || "None (Default Index, Follow)"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Structured Data (Schema)</div>
                <div className="font-medium text-gray-900">{result.hasSchema ? result.schemaTypes : <span className="text-amber-500">None detected</span>}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Internal Links</div>
                  <div className="font-medium text-gray-900">{result.internalLinks}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-semibold uppercase mb-1">External Links</div>
                  <div className="font-medium text-gray-900">{result.externalLinks}</div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Images Without Alt</div>
                <div className={`font-medium ${result.imagesWithoutAlt > 0 ? 'text-red-600' : 'text-gray-900'}`}>{result.imagesWithoutAlt}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
