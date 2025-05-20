/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // For faster builds, ignore typescript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // For faster builds, ignore eslint errors
    ignoreDuringBuilds: true,
  },
  // Optimize images for Netlify
  images: {
    unoptimized: true, // Required for Netlify
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'lh3.googleusercontent.com',
      'localhost',
      'employee-admin-c83e8.appspot.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Basic configuration - no rewrites for Netlify
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig; 