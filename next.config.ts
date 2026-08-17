import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      }
    ],
  },
  serverExternalPackages: ['firebase-admin'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Empêche le site d'être mis dans un iframe (Clickjacking)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Empêche le navigateur de deviner le type de fichier
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Protège les données de provenance
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // Force le HTTPS pendant 1 an
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Bloque l'accès aux capteurs si inutile
          },
        ],
      },
    ];
  },
};

export default nextConfig;
