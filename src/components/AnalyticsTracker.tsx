'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Avoid tracking in admin panel to not skew data
    if (pathname.startsWith('/admin')) return;

    const trackVisit = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pathname })
        });
      } catch (error) {
        // Silently fail if tracking fails
      }
    };

    trackVisit();
  }, [pathname]);

  return null; // This component does not render anything
}
