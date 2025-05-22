/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  experimental: {
    // Enable App directory features
    appDir: true,
    optimizeCss: true,
    optimizePackageImports: ['react-icons', 'firebase'],
    // Enable server components if used
    serverComponents: true,
  },
  // Optimize build output
  poweredByHeader: false,
  compress: true,
  
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