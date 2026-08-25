'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  src: string;
  alt: string;
  label: string;
  className?: string;
}

export default function BrandLogo({ src, alt, label, className = "object-contain mix-blend-multiply" }: BrandLogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50/50 rounded-full ${className}`}>
        <span className="text-xl md:text-3xl font-serif text-gray-400">
          {label.substring(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image 
      src={src} 
      alt={alt}
      fill
      sizes="(max-width: 768px) 150px, 200px"
      className={className} 
      onError={() => setError(true)}
    />
  );
}
