import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, Key, LayoutTemplate, Settings2, Map, Sparkles } from 'lucide-react';

const SEO_TABS = [
  { href: '/admin/seo', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { href: '/admin/seo/search-console', label: 'Search Console', icon: <Search size={16} /> },
  { href: '/admin/seo/keywords', label: 'Keywords', icon: <Key size={16} /> },
  { href: '/admin/seo/pages-seo', label: 'Pages SEO', icon: <LayoutTemplate size={16} /> },
  { href: '/admin/seo/technical', label: 'Technical SEO', icon: <Settings2 size={16} /> },
  { href: '/admin/seo/sitemap', label: 'Sitemap', icon: <Map size={16} /> },
  { href: '/admin/seo/ai-assistant', label: 'AI Assistant', icon: <Sparkles size={16} /> },
];

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">SEO Manager</h1>
        <p className="text-gray-500 text-sm">Monitor and optimize your search engine visibility.</p>
      </div>

      <div className="mb-8 overflow-x-auto">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {children}
      </div>
    </div>
  );
}
