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
    optimizeCss: true,
    optimizePackageImports: [
      '@heroicons/react',
      '@material-tailwind/react',
      '@tremor/react',
      'react-icons',
      'lodash',
      'date-fns',
    ],
    webpackBuildWorker: true,
  },
  
  serverExternalPackages: ['prisma'],

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

  turbopack: {
    resolveAlias: {
      '@': './',
      '@/components': './components',
      '@/hooks': './hooks',
      '@/utils': './utils',
      '@/types': './types',
    },
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  webpack: (config, { dev, isServer }) => {
    // Optimize for faster builds
    if (dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          providers: {
            test: /[\\/]app[\\/]providers[\\/]/,
            name: 'providers',
            chunks: 'all',
          },
          services: {
            test: /[\\/]app[\\/]services[\\/]/,
            name: 'services',
            chunks: 'all',
          },
        },
      };
    }
    
    // Tree shaking optimizations
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
    
    return config;
  },
};

module.exports = nextConfig;
