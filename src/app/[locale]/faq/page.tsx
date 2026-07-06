import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQComponent from '@/components/FAQ';

export default function FAQPage() {
  return (
    <div className="bg-[#fafaf7] min-h-screen text-[#1A1A1A]">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 py-24 lg:py-32">
        <FAQComponent />
      </main>
      <Footer />
    </div>
  );
}
