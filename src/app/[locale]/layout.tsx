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
import { AuthProvider } from "@/context/AuthContext";
import FacebookPixel from "@/components/FacebookPixel";
import CookieConsent from "@/components/CookieConsent";
import { PreferencesProvider } from "@/context/PreferencesContext";

export const metadata: Metadata = {
  metadataBase: new URL('https://nayparfum.ma'),
  title: {
    template: "%s | NAY Parfums",
    default: "NAY Parfums - L'Authenticité & L'Élégance de la Parfumerie Orientale",
  },
  description: "Découvrez notre collection exclusive de parfums orientaux. L'authenticité et l'élégance à travers des fragrances uniques.",
  keywords: ["parfum", "parfum oriental", "fragrance", "luxe", "maroc", "oud", "musc"],
  authors: [{ name: "NAY Parfums" }],
  creator: "NAY Parfums",
  publisher: "NAY Parfums",
  alternates: {
    canonical: "https://nayparfum.ma",
  },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: "https://nayparfum.ma",
    title: "NAY Parfums | Parfumerie de Luxe au Maroc",
    description: "Découvrez notre collection de parfums de luxe. Revendeur officiel des grandes marques au Maroc. 100% authentiques.",
    siteName: "NAY Parfums"
  },
  twitter: {
    card: "summary_large_image",
    title: "NAY Parfums | Parfumerie de Luxe au Maroc",
    description: "Découvrez notre collection de parfums de luxe. Revendeur officiel au Maroc."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NAY Parfums",
              url: "https://nayparfum.ma",
              logo: "https://nayparfum.ma/icon.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+212 5 35 63 42 18",
                contactType: "customer service",
                areaServed: "MA",
                availableLanguage: ["fr", "en", "ar"]
              }
            })
          }}
        />
        <DictionaryProvider dictionary={dictionary}>
          <PreferencesProvider>
            {/* <SmoothScrollProvider> */}
              <AuthProvider>
                <CartProvider>
                  <FacebookPixel />
                  <AnalyticsTracker />
                  {children}
                </CartProvider>
              </AuthProvider>
            {/* </SmoothScrollProvider> */}
            <WhatsAppButton />
            <CookieConsent />
          </PreferencesProvider>
        </DictionaryProvider>
      </body>
    </html>
  );
}
