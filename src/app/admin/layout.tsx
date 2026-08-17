import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNotifier from "@/components/AdminNotifier";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin | NAY Parfums",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#f8fafc] text-[#1A1A1A] antialiased flex flex-col lg:flex-row min-h-screen">
        <AdminSidebar />
        <main className="flex-1 pt-20 lg:pt-4 lg:ml-[260px] p-4 lg:p-8 w-full overflow-x-hidden">
          {children}
        </main>
        
        <AdminNotifier />
      </body>
    </html>
  );
}
