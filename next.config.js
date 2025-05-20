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
    unoptimized: true, // Set to true for Netlify deployment
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Rewrite configuration
  async rewrites() {
    // Get the document generator URL from environment variables or use defaults
    const docGenUrl = process.env.DOCUMENT_GENERATOR_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001'
        : 'https://document-generator.yourdomain.com');
    
    return [
      {
        source: '/document-generator/:path*',
        destination: `${docGenUrl}/:path*`
      }
    ]
  }
};

module.exports = nextConfig; 