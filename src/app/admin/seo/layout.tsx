'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, Key, Sparkles, Settings2, Map, Link as LinkIcon, RefreshCw, BarChart2, FolderTree, FileEdit, Calendar, Network, MapPin, Settings, DollarSign, Target, Activity } from 'lucide-react';

const SEO_TABS = [
  { href: '/admin/seo', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { href: '/admin/seo/revenue', label: 'SEO Revenue', icon: <DollarSign size={16} /> },
  { href: '/admin/seo/landing-pages', label: 'Landing Pages', icon: <Target size={16} /> },
  { href: '/admin/seo/search-console', label: 'Search Console', icon: <Search size={16} /> },
  { href: '/admin/seo/keywords', label: 'Keywords', icon: <Key size={16} /> },
  { href: '/admin/seo/opportunities', label: 'Opportunities', icon: <Sparkles size={16} /> },
  { href: '/admin/seo/content-updates', label: 'Content Updates', icon: <FileEdit size={16} /> },
  { href: '/admin/seo/topical-authority', label: 'Topical Authority', icon: <FolderTree size={16} /> },
  { href: '/admin/seo/content-gaps', label: 'Content Gaps', icon: <FileEdit size={16} /> },
  { href: '/admin/seo/content-strategy', label: 'Content Strategy', icon: <Calendar size={16} /> },
  { href: '/admin/seo/search-intent', label: 'Search Intent', icon: <BarChart2 size={16} /> },
  { href: '/admin/seo/internal-links', label: 'Internal Links', icon: <Network size={16} /> },
  { href: '/admin/seo/backlinks', label: 'Backlinks', icon: <LinkIcon size={16} /> },
  { href: '/admin/seo/local', label: 'Local SEO', icon: <MapPin size={16} /> },
  { href: '/admin/seo/technical', label: 'Technical SEO', icon: <Settings2 size={16} /> },
  { href: '/admin/seo/sitemap', label: 'Sitemap', icon: <Map size={16} /> },
  { href: '/admin/seo/analytics/health', label: 'Tracking Health', icon: <Activity size={16} /> },
  { href: '/admin/seo/ai-assistant', label: 'AI Assistant', icon: <RefreshCw size={16} /> },
  { href: '/admin/seo/settings', label: 'Settings', icon: <Settings size={16} /> },
];

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">MOROCCO SEO GROWTH ENGINE</h1>
        <p className="text-gray-500 text-sm">Optimize your visibility and traffic for the Moroccan market.</p>
      </div>

      <div className="mb-8 overflow-x-auto pb-2">
        <nav className="flex space-x-1 border-b border-gray-200 min-w-max">
          {SEO_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {children}
      </div>
    </div>
  );
}
