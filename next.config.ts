import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  images: {
    // Optimized listing photos come from Unsplash (demo data) and Supabase
    // Storage public URLs (agent uploads). Allow both for next/image.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/**' },
    ],
  },
};

export default nextConfig;
