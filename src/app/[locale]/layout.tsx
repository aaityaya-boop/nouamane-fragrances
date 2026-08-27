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
import AIChatWidget from "@/components/AIChatWidget";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics/GoogleTagManager";

export const metadata: Metadata = {
  metadataBase: new URL('https://nayparfum.ma'),
  title: {
    template: "%s | NAY Parfums",
    default: "NAY Parfums - Testeurs & Parfums Originaux au Maroc",
  },
  description: "Découvrez NAY Parfums, achetez vos parfums de luxe et testeurs 100% originaux. Livraison rapide partout au Maroc (Casablanca, Rabat...) et paiement à la livraison. عطور أصلية في المغرب",
  keywords: [
    "parfum original Maroc", "acheter parfum luxe Maroc", "testeur parfum authentique", "site vente parfum Maroc", 
    "parfumerie en ligne Maroc", "عطور أصلية في المغرب", "تستر عطور ماركات", "nay parfum", 
    "parfum marrakech", "agadir", "casablanca", "rabat", "tanger", "parfum oriental", "oud"
  ],
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
    title: "NAY Parfums | Testeurs & Parfums Originaux au Maroc",
    description: "Achetez vos parfums et testeurs 100% originaux au Maroc. Livraison rapide et paiement à la livraison (Casablanca, Rabat, Marrakech, etc.).",
    siteName: "NAY Parfums"
  },
  twitter: {
    card: "summary_large_image",
    title: "NAY Parfums | Parfums Originaux au Maroc",
    description: "Achetez vos parfums et testeurs originaux au Maroc. Livraison rapide et paiement à la livraison."
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
  verification: {
    other: {
      "msvalidate.01": "B1F888E794820820E31C64BB43593BE1"
    }
  }
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
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
              var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
              ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

                ttq.load('DA87OEJC77UES9745EC0');
                ttq.page();
              }(window, document, 'ttq');
            `
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <GoogleTagManagerNoScript />
        <GoogleTagManager />
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
              },
              sameAs: [
                "https://www.instagram.com/nayparfum",
                "https://www.facebook.com/nayparfum"
              ]
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
            <AIChatWidget />
            <CookieConsent />
          </PreferencesProvider>
        </DictionaryProvider>
        <SpeedInsights />
        <Analytics />

        {/* ========== GOOGLE CUSTOMER REVIEWS BADGE ========== */}
        <Script id="merchantWidgetScript" src="https://www.gstatic.com/shopping/merchant/merchantwidget.js" strategy="afterInteractive" />
        <Script
          id="gcr-badge"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var gcrInterval = setInterval(function() {
                if (typeof merchantwidget !== 'undefined') {
                  clearInterval(gcrInterval);
                  merchantwidget.start({
                    merchant_id: 5828480552,
                    position: 'BOTTOM_LEFT'
                  });
                }
              }, 500);
            `
          }}
        />
      </body>
    </html>
  );
}
