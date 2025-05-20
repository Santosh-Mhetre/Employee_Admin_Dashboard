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
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'lh3.googleusercontent.com',
      'localhost',
      'employee-admin-c83e8.appspot.com',
    ],
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Disable rewrites for Netlify
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const docGenUrl = process.env.DOCUMENT_GENERATOR_URL || 'http://localhost:3001';
      return [
        {
          source: '/document-generator/:path*',
          destination: `${docGenUrl}/:path*`
        }
      ];
    }
    return [];
  },
  // Netlify-specific configuration
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false
};

module.exports = nextConfig; 