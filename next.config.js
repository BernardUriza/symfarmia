let withPWA = (config) => config;
try {
  const pwa = require('next-pwa');
  withPWA = pwa({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/app-build-manifest\.json$/]
  });
} catch (err) {
  console.warn('next-pwa not available, skipping PWA setup');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin dev requests to Next.js assets (for local dev /_next requests)
  allowedDevOrigins: [
    'http://127.0.0.1:3000', 
    'http://localhost:3000',
    'http://127.0.0.1:3002',
    'http://localhost:3002',
    'http://127.0.0.1:*',
    'http://localhost:*'
  ],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  output: process.env.NETLIFY ? 'export' : undefined,
  trailingSlash: true,

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

  // Turbopack configuration (stable)
  turbopack: process.env.NODE_ENV === 'development' ? {
    rules: {
      // Font handling for slick-carousel and medical icons
      '*.{svg,eot,ttf,woff,woff2}': {
        loaders: ['@vercel/turbopack-loader-font'],
        as: 'font'
      }
    },
    resolveAlias: {
      // Medical-grade path resolution for Turbopack
      '@': '/workspaces/symfarmia',
      '@/components': '/workspaces/symfarmia/src/components',
      '@/app': '/workspaces/symfarmia/app',
      '@/hooks': '/workspaces/symfarmia/hooks',
      '@/lib': '/workspaces/symfarmia/lib',
      '@/utils': '/workspaces/symfarmia/src/utils',
      '@/services': '/workspaces/symfarmia/app/services',
      '@/providers': '/workspaces/symfarmia/app/providers'
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.mjs', '.cjs']
  } : undefined,

  experimental: {
    // Emergency: Disable optimizations that cause hanging
    optimizeCss: false,
  },

  // Webpack configuration for production builds only
  // (Development uses Turbopack exclusively)
  ...(process.env.NODE_ENV === 'production' && {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // Only apply webpack optimizations in production
      if (!dev) {
        // Font handling for production builds
        config.module.rules.push({
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/fonts/[name].[hash][ext]'
          }
        });

        // Optimize bundle splitting
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true
            },
            medical: {
              test: /[\\/]src[\\/]domains[\\/]medical-ai[\\/]/,
              name: 'medical-ai',
              priority: 20,
              reuseExistingChunk: true
            }
          }
        };
      }

      // Path resolution for production builds
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': '/workspaces/symfarmia',
        '@/components': '/workspaces/symfarmia/src/components',
        '@/app': '/workspaces/symfarmia/app',
        '@/hooks': '/workspaces/symfarmia/hooks',
        '@/lib': '/workspaces/symfarmia/lib',
        '@/utils': '/workspaces/symfarmia/src/utils',
        '@/services': '/workspaces/symfarmia/app/services',
        '@/providers': '/workspaces/symfarmia/app/providers'
      };

      return config;
    }
  }),
  
  // serverExternalPackages: ['prisma'], // Not available in Next.js 14

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    APP_VERSION: process.env.npm_package_version,
    // OpenAI API Configuration
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    // Medical-grade environment variables (Next.js compatible naming)
    MEDICAL_ERROR_REPORTING: 'true',
    MEDICAL_SYSTEM_VERSION: process.env.npm_package_version || '1.0.0',
    MEDICAL_BUILD_ID: Math.random().toString(36).substr(2, 9),
    BUILD_TIME: new Date().toISOString(),
    BUILD_ENV: process.env.NODE_ENV || 'development',
  },

  async headers() {
    return [
      // GLOBAL HEADERS FOR WHISPER WASM/WEBGPU SUPPORT
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
      {
        source: '/((?!__nextjs_original-stack-frames|_next/webpack-hmr|_next/turbopack-hmr).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(self), camera=(self)' },
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
      // WASM files configuration
      {
        source: '/:path*.wasm',
        headers: [
          { key: 'Content-Type', value: 'application/wasm' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Model files configuration
      {
        source: '/models/:path*.bin',
        headers: [
          { key: 'Content-Type', value: 'application/octet-stream' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
    ];
  },

  // 🚫 WEBPACK ELIMINATED - Turbopack only!
  // All webpack configuration has been moved to experimental.turbo above
};

module.exports = withPWA(nextConfig);
