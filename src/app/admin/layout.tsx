import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin | Nouamane Parfums",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 antialiased flex flex-col lg:flex-row min-h-screen">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 w-full overflow-x-hidden">
          {children}
        </main>
        
        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-50">
          <Link href="/admin/finance" className="text-gray-500 hover:text-sky-600 text-[10px] uppercase font-bold flex flex-col items-center gap-1">Finance</Link>
          <Link href="/admin/orders" className="text-gray-500 hover:text-sky-600 text-[10px] uppercase font-bold flex flex-col items-center gap-1">Commandes</Link>
          <Link href="/admin/products" className="text-gray-500 hover:text-sky-600 text-[10px] uppercase font-bold flex flex-col items-center gap-1">Produits</Link>
          <Link href="/admin/landing-pages" className="text-gray-500 hover:text-sky-600 text-[10px] uppercase font-bold flex flex-col items-center gap-1">Ads</Link>
        </div>
      </body>
    </html>
  );
}
