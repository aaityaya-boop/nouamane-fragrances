import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNotifier from "@/components/AdminNotifier";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin | Nouamane Parfums",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#f8fafc] text-[#1A1A1A] antialiased flex flex-col lg:flex-row min-h-screen">
        <AdminSidebar />
        <main className="flex-1 lg:ml-[260px] p-4 lg:p-8 w-full overflow-x-hidden">
          {children}
        </main>
        
        <AdminNotifier />

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0ddd4] flex justify-around items-center p-3 z-50">
          <Link href="/admin/finance" className="text-[#6B6B6B] hover:text-[#0ea5e9] text-[10px] uppercase font-bold flex flex-col items-center gap-1 transition-colors">Finance</Link>
          <Link href="/admin/orders" className="text-[#6B6B6B] hover:text-[#0ea5e9] text-[10px] uppercase font-bold flex flex-col items-center gap-1 transition-colors">Commandes</Link>
          <Link href="/admin/products" className="text-[#6B6B6B] hover:text-[#0ea5e9] text-[10px] uppercase font-bold flex flex-col items-center gap-1 transition-colors">Produits</Link>
          <Link href="/admin/landing-pages" className="text-[#6B6B6B] hover:text-[#0ea5e9] text-[10px] uppercase font-bold flex flex-col items-center gap-1 transition-colors">Ads</Link>
        </div>
      </body>
    </html>
  );
}
