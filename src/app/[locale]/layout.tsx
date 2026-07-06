import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { notFound } from 'next/navigation';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { CartProvider } from "@/context/CartContext";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import { DictionaryProvider } from "@/context/DictionaryContext";
import { getDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "Nouamane Parfums | Valentino · YSL · Armani",
  description:
    "Revendeur officiel des parfums Valentino, Yves Saint Laurent et Emporio Armani au Maroc. 100% authentiques. Livraison avec 35Dh en 24-48h. Paiement à la livraison.",
  icons: { icon: "/favicon.ico" },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = (['fr', 'en', 'ar'].includes(locale) ? locale : 'fr') as 'fr' | 'en' | 'ar';
  const dictionary = await getDictionary(validLocale);
  const dir = validLocale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={validLocale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <DictionaryProvider dictionary={dictionary}>
          <SmoothScrollProvider>
            <CartProvider>
              <AnalyticsTracker />
              {children}
            </CartProvider>
          </SmoothScrollProvider>
          <WhatsAppButton />
        </DictionaryProvider>
      </body>
    </html>
  );
}
