import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin | NAY Parfums",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white antialiased min-h-screen">
        <AdminLayoutShell>
          {children}
        </AdminLayoutShell>
      </body>
    </html>
  );
}
