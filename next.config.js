/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  output: process.env.NETLIFY ? 'standalone' : undefined,

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: '**.edgestore.dev' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  experimental: {
    webpackBuildWorker: false,
    forceSwcTransforms: true,
  },
  
  // serverExternalPackages: ['prisma'], // Not available in Next.js 14

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    APP_VERSION: process.env.npm_package_version,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(self), camera=()' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
    ];
  },

  // turbopack config not available in Next.js 14
  
  webpack: (config, { dev, isServer }) => {
    // Reduce memory usage in development
    if (dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244000, // Reduce chunk size
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000,
          },
        },
      };
      
      // Reduce memory usage for Codespaces
      config.optimization.minimize = false;
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks.chunks = 'async';
      config.cache = false; // Disable webpack cache
      config.infrastructureLogging = { level: 'error' };
    }

    // Tree shaking optimizations (disabled in dev to save memory)
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    config.optimization.splitChunks.cacheGroups = {
      ...(config.optimization.splitChunks.cacheGroups || {}),
      landing: {
        test: /[\\/]components[\\/]landing[\\/]/,
        name: 'landing',
        chunks: 'all',
        priority: 30,
      },
      animations: {
        test: /[\\/]node_modules[\\/](framer-motion|three|gsap)[\\/]/,
        name: 'animations',
        chunks: 'async',
        priority: 25,
      },
    };
    
    return config;
  },
};

module.exports = nextConfig;
