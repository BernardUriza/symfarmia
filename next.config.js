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
    // Emergency: Disable optimizations that cause hanging
    optimizeCss: false,
    esmExternals: false,
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
  
  webpack: (config, { dev, isServer, webpack }) => {
    // Add webpack progress plugin for build visibility
    if (!dev) {
      const ProgressPlugin = require('webpack').ProgressPlugin;
      config.plugins.push(
        new ProgressPlugin((percentage, message, ...args) => {
          // Send progress to our enhanced build script
          if (process.send) {
            process.send({
              type: 'webpack-progress',
              percentage: Math.round(percentage * 100),
              message,
              args
            });
          }
        })
      );
    }
    
    // Bundle analyzer in production builds with --analyze flag
    if (!dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : '../analyze/client.html',
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: isServer ? '../analyze/server-stats.json' : '../analyze/client-stats.json',
        })
      );
    }
    
    // EMERGENCY: Disable webpack optimizations that cause hanging
    if (process.env.WEBPACK_MINIMIZE === 'false') {
      config.optimization.minimize = false;
      config.optimization.minimizer = [];
    }
    
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
      
      // Production optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return module.size() > 160000 &&
                /node_modules[\\/]/.test(module.identifier());
            },
            name(module) {
              const hash = require('crypto')
                .createHash('sha1')
                .update(module.identifier())
                .digest('hex');
              return hash.substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name(module, chunks) {
              return (
                'shared-' +
                require('crypto')
                  .createHash('sha1')
                  .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                  .digest('hex')
                  .substring(0, 8)
              );
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
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
    
    // Add build time stats
    config.plugins.push(
      new webpack.DefinePlugin({
        '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
        '__BUILD_ENV__': JSON.stringify(process.env.NODE_ENV || 'development'),
      })
    );
    
    return config;
  },
};

module.exports = nextConfig;
