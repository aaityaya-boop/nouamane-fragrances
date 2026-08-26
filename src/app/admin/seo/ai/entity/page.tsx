"use client";

import { CheckCircle2, Globe, Building2, Languages, Link as LinkIcon, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function EntityPage() {
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/seo/ai/brand-audit', { method: 'POST' });
      // In a real app we'd show a toast or refresh data
      alert("Brand audit triggered successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to trigger brand audit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Entity Optimization</h1>
          <p className="text-muted-foreground">
            Manage how AI platforms understand the &quot;NAY Parfum&quot; entity.
          </p>
        </div>
        <button
          onClick={handleAudit}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 bg-black text-white"
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Trigger Brand Audit
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-xl font-bold">NAY Parfum</h3>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="p-6 pt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Website:</span>
              <span className="text-sm text-muted-foreground">https://nayparfum.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Category:</span>
              <span className="text-sm text-muted-foreground">Fragrance Brand, E-commerce</span>
            </div>
            <div className="flex items-center gap-3">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Languages:</span>
              <span className="text-sm text-muted-foreground">English, French, Arabic</span>
            </div>
            <div className="flex items-start gap-3">
              <LinkIcon className="h-4 w-4 text-muted-foreground mt-1" />
              <span className="text-sm font-medium">Social Profiles:</span>
              <div className="text-sm text-muted-foreground flex flex-col gap-1">
                <a href="#" className="hover:underline text-blue-600">Instagram</a>
                <a href="#" className="hover:underline text-blue-600">Facebook</a>
                <a href="#" className="hover:underline text-blue-600">TikTok</a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-xl font-bold">Schema Status</h3>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="p-6 pt-4 space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Organization Schema Validated</span>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Structured data helps AI search engines understand the relationships between your brand, products, and social profiles.
            </p>

            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Detected Entities:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">Moroccan Perfume</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">Luxury Fragrance</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">Extrait de Parfum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
