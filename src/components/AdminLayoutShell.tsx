'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import AdminNotifier from '@/components/AdminNotifier';

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="w-full min-h-screen bg-white text-slate-900 overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] text-[#1A1A1A] antialiased flex flex-col lg:flex-row min-h-screen w-full">
      <AdminSidebar />
      <main className="flex-1 pt-20 lg:pt-4 lg:ml-[260px] p-4 lg:p-8 w-full overflow-x-hidden flex flex-col min-h-screen">
        <AdminHeader />
        <div className="flex-1">
          {children}
        </div>
      </main>
      <AdminNotifier />
    </div>
  );
}
