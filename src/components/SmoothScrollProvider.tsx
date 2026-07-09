'use client';

import { ReactLenis } from 'lenis/react';

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        // Lenis's built-in fix: resets scroll inertia when a cross-page link is clicked,
        // allowing Next.js router to complete navigation without interference.
        stopInertiaOnNavigate: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
