/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during production builds
    ignoreBuildErrors: true,
  },
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'lh3.googleusercontent.com',
      'localhost',
      'employee-admin-c83e8.appspot.com',
    ],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons', 'firebase'],
  },
  // Optimize build output
  poweredByHeader: false,
  compress: true,
  
  async rewrites() {
    try {
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
      ];
    } catch (error) {
      console.warn('Error in rewrites config:', error);
      return [];
    }
  },
  
  // Add dynamic import to reduce initial JS bundle size
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations for production builds
    if (!dev) {
      // Split chunks more aggressively in production
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for third-party libraries
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'async',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig; 