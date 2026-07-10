'use client';

import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<any>(null);
  const pathname = usePathname();

  // When the route changes, immediately stop Lenis inertia and scroll to top.
  // This prevents Lenis from intercepting the Next.js router's navigation.
  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (lenis) {
      // Stop scrolling immediately so the new page starts at the top
      lenis.stop();
      window.scrollTo(0, 0);
      // Re-enable after a short delay to allow page paint
      const timer = setTimeout(() => {
        lenis.start();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        // Prevent Lenis from interfering with anchor tag navigation
        prevent: (node: Element) => {
          // Allow native navigation on anchor tags that link to other pages
          if (node.tagName === 'A') {
            const href = node.getAttribute('href');
            if (href && !href.startsWith('#')) {
              return true;
            }
          }
          return false;
        },
      }}
    >
      {children}
    </ReactLenis>
  );
}
