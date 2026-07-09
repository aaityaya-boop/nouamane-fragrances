'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has already been given or denied
    const consent = Cookies.get('nouamane_consent_granted');
    if (!consent) {
      // Small delay to not overwhelm the user immediately
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    Cookies.set('nouamane_consent_granted', 'true', { expires: 365, path: '/' });
    setShowBanner(false);
    
    // Optionally trigger any analytics or tracking initialization here
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cookies_accepted'));
    }
  };

  const declineCookies = () => {
    Cookies.set('nouamane_consent_granted', 'false', { expires: 365, path: '/' });
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto bg-black/90 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl pointer-events-auto border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm leading-relaxed text-[#D1D1D1] text-center md:text-left">
              <span className="font-bold text-white text-base block mb-1">Respect de votre vie privée 🍪</span>
              Nous utilisons des cookies pour sauvegarder votre panier, mémoriser vos préférences et analyser notre trafic afin de vous offrir la meilleure expérience possible sur notre boutique.
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={declineCookies}
                className="flex-1 md:flex-none text-[11px] font-bold tracking-[0.1em] uppercase border border-white/20 text-[#9A9A9A] hover:text-white px-6 py-3 rounded-full transition-all"
              >
                Refuser
              </button>
              <button
                onClick={acceptCookies}
                className="flex-1 md:flex-none text-[11px] font-bold tracking-[0.1em] uppercase bg-white text-black px-6 py-3 rounded-full hover:bg-black hover:text-white border border-transparent hover:border-white transition-all"
              >
                Accepter
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
